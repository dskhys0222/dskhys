/**
 * 評価額を計算
 * @param shares 保有株数
 * @param currentPrice 現在価格
 * @returns 評価額
 */
export function calculateMarketValue(
    shares: number,
    currentPrice: number
): number {
    return shares * currentPrice;
}

/**
 * 損益を計算
 * @param shares 保有株数
 * @param currentPrice 現在価格
 * @param acquisitionPrice 取得単価
 * @returns 損益
 */
export function calculateProfit(
    shares: number,
    currentPrice: number,
    acquisitionPrice: number
): number {
    const marketValue = calculateMarketValue(shares, currentPrice);
    const cost = shares * acquisitionPrice;
    return marketValue - cost;
}

/**
 * 損益率を計算（%）
 * @param profit 損益
 * @param cost 取得コスト
 * @returns 損益率（%）
 */
export function calculateProfitRate(profit: number, cost: number): number {
    if (cost === 0) return 0;
    return (profit / cost) * 100;
}

/**
 * 取得コストを計算
 * @param shares 保有株数
 * @param acquisitionPrice 取得単価
 * @returns 取得コスト
 */
export function calculateCost(
    shares: number,
    acquisitionPrice: number
): number {
    return shares * acquisitionPrice;
}
