import { describe, expect, it } from 'vitest';

// マッピングのロジックをテスト

interface StockMapping {
    id: string;
    mfStockId: string;
    stockId: string | null;
    action: 'update' | 'skip' | 'new';
    createdAt: string;
    updatedAt: string;
}

interface MFStock {
    id: string;
    name: string;
    units: number;
    averageCost: number;
    currentPrice: number;
    value: number;
    profitLoss: number;
    account: string;
}

interface Stock {
    id: string;
    name: string;
    ticker: string;
    value: number;
}

// 自動マッピング候補を提案
const suggestMapping = (mfStock: MFStock, stocks: Stock[]): Stock | null => {
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

// マッピングから更新対象を抽出
const getStocksToUpdate = (
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

describe('MFマッピング（ID ベース）', () => {
    describe('suggestMapping', () => {
        const stocks: Stock[] = [
            { id: '1', name: 'VTI', ticker: 'VTI', value: 1000000 },
            {
                id: '2',
                name: 'eMAXIS Slim 全世界株式',
                ticker: 'ACWI',
                value: 500000,
            },
            { id: '3', name: '現金', ticker: 'JPY', value: 100000 },
        ];

        it('完全一致する銘柄を提案する', () => {
            const mfStock: MFStock = {
                id: 'VTI_SBI証券',
                name: 'VTI',
                units: 10,
                averageCost: 100000,
                currentPrice: 110000,
                value: 1100000,
                profitLoss: 100000,
                account: 'SBI証券',
            };

            const result = suggestMapping(mfStock, stocks);
            expect(result).toEqual(stocks[0]);
        });

        it('ティッカーで一致する銘柄を提案する', () => {
            const mfStock: MFStock = {
                id: 'ACWI_SBI証券',
                name: 'ACWI',
                units: 5,
                averageCost: 100000,
                currentPrice: 110000,
                value: 550000,
                profitLoss: 50000,
                account: 'SBI証券',
            };

            const result = suggestMapping(mfStock, stocks);
            expect(result).toEqual(stocks[1]);
        });

        it('部分一致する銘柄を提案する', () => {
            const mfStock: MFStock = {
                id: 'eMAXIS_Slim_全世界株式_SBI証券',
                name: 'eMAXIS Slim 全世界株式（オール・カントリー）',
                units: 100,
                averageCost: 5000,
                currentPrice: 5500,
                value: 550000,
                profitLoss: 50000,
                account: 'SBI証券',
            };

            const result = suggestMapping(mfStock, stocks);
            expect(result).toEqual(stocks[1]);
        });

        it('一致しない場合はnullを返す', () => {
            const mfStock: MFStock = {
                id: '未知の銘柄_不明な口座',
                name: '未知の銘柄',
                units: 1,
                averageCost: 1000,
                currentPrice: 1000,
                value: 1000,
                profitLoss: 0,
                account: '不明な口座',
            };

            const result = suggestMapping(mfStock, stocks);
            expect(result).toBeNull();
        });
    });

    describe('getStocksToUpdate', () => {
        const mfStocks: MFStock[] = [
            {
                id: 'VTI_SBI証券',
                name: 'VTI',
                units: 10,
                averageCost: 100000,
                currentPrice: 110000,
                value: 1100000,
                profitLoss: 100000,
                account: 'SBI証券',
            },
            {
                id: 'JPY_SBI銀行',
                name: '現金',
                units: 1,
                averageCost: 100000,
                currentPrice: 100000,
                value: 100000,
                profitLoss: 0,
                account: 'SBI銀行',
            },
            {
                id: 'VTI_楽天証券',
                name: 'VTI',
                units: 5,
                averageCost: 100000,
                currentPrice: 110000,
                value: 550000,
                profitLoss: 50000,
                account: '楽天証券',
            },
        ];

        it('マッピング済みの銘柄のみ更新対象として返す', () => {
            const mappings: StockMapping[] = [
                {
                    id: 'm1',
                    mfStockId: 'VTI_SBI証券',
                    stockId: 'stock-1',
                    action: 'update',
                    createdAt: '2026-01-13',
                    updatedAt: '2026-01-13',
                },
                {
                    id: 'm2',
                    mfStockId: 'JPY_SBI銀行',
                    stockId: null,
                    action: 'skip',
                    createdAt: '2026-01-13',
                    updatedAt: '2026-01-13',
                },
            ];

            const result = getStocksToUpdate(mfStocks, mappings);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                stockId: 'stock-1',
                newValue: 1100000,
                newUnits: 10,
                newAverageCost: 100000,
                newCurrentPrice: 110000,
            });
        });

        it('mfStockIdで正確にマッピングを検索する', () => {
            const mappings: StockMapping[] = [
                {
                    id: 'm1',
                    mfStockId: 'VTI_SBI証券',
                    stockId: 'stock-1',
                    action: 'update',
                    createdAt: '2026-01-13',
                    updatedAt: '2026-01-13',
                },
                {
                    id: 'm2',
                    mfStockId: 'VTI_楽天証券',
                    stockId: 'stock-2',
                    action: 'update',
                    createdAt: '2026-01-13',
                    updatedAt: '2026-01-13',
                },
            ];

            const result = getStocksToUpdate(mfStocks, mappings);
            expect(result).toHaveLength(2);
            expect(result).toContainEqual({
                stockId: 'stock-1',
                newValue: 1100000,
                newUnits: 10,
                newAverageCost: 100000,
                newCurrentPrice: 110000,
            });
            expect(result).toContainEqual({
                stockId: 'stock-2',
                newValue: 550000,
                newUnits: 5,
                newAverageCost: 100000,
                newCurrentPrice: 110000,
            });
        });

        it('マッピングがない銘柄は更新対象に含まれない', () => {
            const mappings: StockMapping[] = [];
            const result = getStocksToUpdate(mfStocks, mappings);
            expect(result).toHaveLength(0);
        });

        it('skipアクションの銘柄は更新対象に含まれない', () => {
            const mappings: StockMapping[] = [
                {
                    id: 'm1',
                    mfStockId: 'VTI_SBI証券',
                    stockId: 'stock-1',
                    action: 'skip',
                    createdAt: '2026-01-13',
                    updatedAt: '2026-01-13',
                },
            ];

            const result = getStocksToUpdate(mfStocks, mappings);
            expect(result).toHaveLength(0);
        });
    });
});
