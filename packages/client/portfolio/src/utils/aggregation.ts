import type { Stock } from '@/types';

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
