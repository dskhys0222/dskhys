import type { DividendInfo, Stock } from '@/types';

/**
 * 配当金集計の対象になる銘柄をフィルタリング
 */
export function filterDividendStocks(stocks: Stock[]): Stock[] {
    return stocks.filter((stock) => stock.includeDividend === true);
}

/**
 * 年間配当金額の合計を計算（1口あたりの配当金×口数）
 */
export function calculateTotalDividendAmount(stocks: Stock[]): number {
    return filterDividendStocks(stocks).reduce((sum, stock) => {
        const dividendPerUnit = stock.dividendAmount || 0;
        const units = stock.units || 0;
        return sum + dividendPerUnit * units;
    }, 0);
}

/**
 * 配当対象銘柄の合計配当金を計算（1口あたり×口数）
 */
export function calculateDividendStocksTotalAmount(stocks: Stock[]): number {
    return filterDividendStocks(stocks).reduce((sum, stock) => {
        const dividendPerUnit = stock.dividendAmount || 0;
        const units = stock.units || 0;
        return sum + dividendPerUnit * units;
    }, 0);
}

/**
 * 配当金情報を集計
 */
export function aggregateDividendInfo(stocks: Stock[]): DividendInfo {
    const dividendStocks = filterDividendStocks(stocks);

    const totalDividendAmount = calculateTotalDividendAmount(stocks);

    const stockDetails = dividendStocks
        .map((stock) => {
            const dividendPerUnit = stock.dividendAmount || 0;
            const units = stock.units || 0;
            const totalAmount = dividendPerUnit * units;
            return {
                stockId: stock.id,
                name: stock.name,
                ticker: stock.ticker,
                amount: totalAmount,
                yield: 0, // 利回りは表示不要
            };
        })
        .sort((a, b) => b.amount - a.amount);

    return {
        annualAmount: totalDividendAmount,
        yieldPercent: 0,
        stockCount: dividendStocks.length,
        stockDetails,
    };
}

/**
 * 銘柄に配当金データを反映
 */
export function enrichStockWithDividendYield(stock: Stock): Stock {
    return stock;
}

/**
 * 複数銘柄に配当利回りを反映
 */
export function enrichStocksWithDividendYields(stocks: Stock[]): Stock[] {
    return stocks;
}
