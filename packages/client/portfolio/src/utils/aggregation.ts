import type { AggregatedData, Stock } from '@/types';

type AggregationField = 'assetClass' | 'region' | 'attribute' | 'account';

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

    return Object.entries(aggregated).map(([name, value]) => ({
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
