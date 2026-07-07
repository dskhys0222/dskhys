import type { AggregatedData, CustomAggregation, Stock } from '@/types';

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

/**
 * カスタム集計のデータを計算
 * @param stocks 銘柄リスト
 * @param aggregation カスタム集計定義
 * @returns 集計データ（value > 0 のもののみ）
 */
export function aggregateCustom(
    stocks: Stock[],
    aggregation: CustomAggregation
): AggregatedData[] {
    const totals: Record<string, number> = {};

    for (const attr of aggregation.attributes) {
        totals[attr.name] = 0;
    }

    for (const assignment of aggregation.stockAssignments) {
        const stock = stocks.find((s) => s.id === assignment.stockId);
        if (stock) {
            totals[assignment.attributeName] =
                (totals[assignment.attributeName] || 0) + stock.value;
        }
    }

    const total = Object.values(totals).reduce((sum, val) => sum + val, 0);

    const profitLossTotals: Record<string, number> = {};
    const costTotals: Record<string, number> = {};
    const hasCostData: Record<string, boolean> = {};

    for (const attr of aggregation.attributes) {
        profitLossTotals[attr.name] = 0;
        costTotals[attr.name] = 0;
        hasCostData[attr.name] = false;
    }

    for (const assignment of aggregation.stockAssignments) {
        const stock = stocks.find((s) => s.id === assignment.stockId);
        if (
            stock &&
            stock.units !== undefined &&
            stock.averageCost !== undefined
        ) {
            const cost = stock.units * stock.averageCost;
            profitLossTotals[assignment.attributeName] =
                (profitLossTotals[assignment.attributeName] || 0) +
                (stock.value - cost);
            costTotals[assignment.attributeName] =
                (costTotals[assignment.attributeName] || 0) + cost;
            hasCostData[assignment.attributeName] = true;
        }
    }

    return aggregation.attributes
        .map((attr) => {
            const value = totals[attr.name] || 0;
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const targetRatio = attr.targetRatio;

            let difference: number | undefined;
            if (targetRatio !== undefined && targetRatio > 0) {
                const totalRatio = aggregation.attributes.reduce(
                    (sum, a) => sum + (a.targetRatio || 0),
                    0
                );
                if (totalRatio > 0) {
                    const targetValue = (total * targetRatio) / totalRatio;
                    difference = value - targetValue;
                }
            }

            let profitLoss: number | undefined;
            let profitLossRate: number | undefined;
            if (hasCostData[attr.name]) {
                profitLoss = profitLossTotals[attr.name];
                const cost = costTotals[attr.name];
                if (cost > 0) {
                    profitLossRate = (profitLoss / cost) * 100;
                }
            }

            return {
                name: attr.name,
                value,
                percentage,
                targetRatio,
                difference,
                profitLoss,
                profitLossRate,
            };
        })
        .filter((item) => item.value > 0);
}
