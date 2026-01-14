import type { AggregatedData, Stock } from '@/types';

type AggregationField = 'assetClass' | 'region' | 'attribute' | 'account';

/**
 * フィールド別のソート順序を定義
 */
const sortOrderMap: Record<AggregationField, string[]> = {
    assetClass: ['現金', '株式', 'コモディティ'],
    region: ['日本', '米国', '全世界'],
    attribute: ['現金', 'インデックス', '増配', 'ゴールド', '暗号通貨'],
    account: ['預金', '暗号資産', '特定', 'NISA', 'DC'],
};

/**
 * フィールド別に評価額を集計（ドーナツグラフ用）
 * @param stocks 銘柄リスト
 * @param field 集計対象フィールド
 * @returns 集計結果（名前、評価額、パーセンテージ）
 */
export function aggregateByField(
    stocks: Stock[],
    field: AggregationField
): AggregatedData[] {
    const aggregated: Record<string, number> = {};

    for (const stock of stocks) {
        const key = stock[field];
        if (!key) continue;

        if (!aggregated[key]) {
            aggregated[key] = 0;
        }

        aggregated[key] += stock.value;
    }

    const totalValue = Object.values(aggregated).reduce(
        (sum, value) => sum + value,
        0
    );

    if (totalValue === 0) return [];

    const sortOrder = sortOrderMap[field];
    const entries = Object.entries(aggregated);

    // ソート順序に基づいて並び替え
    entries.sort((a, b) => {
        const indexA = sortOrder.indexOf(a[0]);
        const indexB = sortOrder.indexOf(b[0]);

        // 定義されている順序に基づいてソート
        const aPos = indexA === -1 ? sortOrder.length : indexA;
        const bPos = indexB === -1 ? sortOrder.length : indexB;

        return aPos - bPos;
    });

    return entries.map(([name, value]) => ({
        name,
        value,
        percentage: Number(((value / totalValue) * 100).toFixed(1)),
    }));
}

/**
 * 総評価額を計算
 * @param stocks 銘柄リスト
 * @returns 総評価額
 */
export function calculateTotalValue(stocks: Stock[]): number {
    return stocks.reduce((sum, stock) => sum + stock.value, 0);
}

/**
 * 総評価損益を計算
 * @param stocks 銘柄リスト
 * @returns 総評価損益
 */
export function calculateTotalProfitLoss(stocks: Stock[]): number {
    return stocks.reduce((sum, stock) => {
        if (!stock.units || !stock.averageCost) {
            return sum;
        }
        const cost = stock.units * stock.averageCost;
        const profitLoss = stock.value - cost;
        return sum + profitLoss;
    }, 0);
}
