import type { MFStock, Stock, StockMapping } from '@/types';

/**
 * 自動マッピング候補を提案
 */
export const suggestMapping = (
    mfStock: MFStock,
    stocks: Stock[]
): Stock | null => {
    // 完全一致
    const exactMatch = stocks.find(
        (s) => s.name === mfStock.name || s.ticker === mfStock.name
    );
    if (exactMatch) return exactMatch;

    // 部分一致（銘柄名に含まれる）
    const partialMatch = stocks.find(
        (s) =>
            mfStock.name.includes(s.name) ||
            s.name.includes(mfStock.name) ||
            mfStock.name.includes(s.ticker)
    );
    if (partialMatch) return partialMatch;

    return null;
};

/**
 * マッピングから更新対象を抽出（mfStockId で検索）
 */
export const getStocksToUpdate = (
    mfStocks: MFStock[],
    mappings: StockMapping[]
): {
    stockId: string;
    newValue: number;
    newUnits: number;
    newAverageCost: number;
    newCurrentPrice: number;
}[] => {
    const result: {
        stockId: string;
        newValue: number;
        newUnits: number;
        newAverageCost: number;
        newCurrentPrice: number;
    }[] = [];

    for (const mfStock of mfStocks) {
        const mapping = mappings.find((m) => m.mfStockId === mfStock.id);

        if (mapping && mapping.action === 'update' && mapping.stockId) {
            result.push({
                stockId: mapping.stockId,
                newValue: mfStock.value,
                newUnits: mfStock.units,
                newAverageCost: mfStock.averageCost,
                newCurrentPrice: mfStock.currentPrice,
            });
        }
    }

    return result;
};

/**
 * 初期マッピングを生成（既存の銘柄との自動マッピングを試みる）
 * mfStockId を使用して1対1対応
 */
export const createInitialMappings = (
    mfStocks: MFStock[],
    stocks: Stock[],
    existingMappings: StockMapping[]
): StockMapping[] => {
    const now = new Date().toISOString();
    const result: StockMapping[] = [];

    for (const mfStock of mfStocks) {
        // mfStockId で既存マッピングを検索
        const existing = existingMappings.find(
            (m) => m.mfStockId === mfStock.id
        );

        if (existing) {
            // 既存マッピングを保持
            result.push({
                ...existing,
                updatedAt: now,
            });
            continue;
        }

        // 自動マッピング候補を提案
        const suggested = suggestMapping(mfStock, stocks);

        result.push({
            id: crypto.randomUUID(),
            mfStockId: mfStock.id,
            stockId: suggested?.id ?? null,
            action: suggested ? 'update' : 'skip',
            createdAt: now,
            updatedAt: now,
        });
    }

    return result;
};
