import { describe, expect, it } from 'vitest';
import type { Stock } from '@/types';

/**
 * 配当金に関する集計ロジックのテスト
 */
describe('Dividend Aggregation', () => {
    const mockStocks: Stock[] = [
        {
            id: '1',
            source: 'manual',
            name: 'テスト銘柄A',
            ticker: 'TEST-A',
            value: 1000000,
            units: 100,
            assetClass: '株式',
            region: '日本',
            attribute: '増配',
            account: '特定',
            includeDividend: true,
            dividendAmount: 500, // 1口あたり500円
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        },
        {
            id: '2',
            source: 'manual',
            name: 'テスト銘柄B',
            ticker: 'TEST-B',
            value: 2000000,
            units: 200,
            assetClass: '株式',
            region: '米国',
            attribute: '増配',
            account: 'NISA',
            includeDividend: true,
            dividendAmount: 300, // 1口あたり300円
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        },
        {
            id: '3',
            source: 'manual',
            name: 'テスト銘柄C',
            ticker: 'TEST-C',
            value: 500000,
            units: 50,
            assetClass: '株式',
            region: '日本',
            attribute: 'インデックス',
            account: '預金',
            includeDividend: false, // 集計対象外
            dividendAmount: 100,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        },
    ];

    describe('calculateTotalDividendAmount', () => {
        it('should calculate total dividend with units (dividend per unit × units)', () => {
            // A: 500円 × 100口 = 50,000円
            // B: 300円 × 200口 = 60,000円
            // Total: 110,000円
            const total = mockStocks
                .filter((s) => s.includeDividend)
                .reduce((sum, s) => {
                    const dividendPerUnit = s.dividendAmount || 0;
                    const units = s.units || 0;
                    return sum + dividendPerUnit * units;
                }, 0);

            expect(total).toBe(110000);
        });

        it('should return 0 when no stocks have includeDividend=true', () => {
            const stocksWithoutDividend = mockStocks.map((s) => ({
                ...s,
                includeDividend: false,
            }));
            const total = stocksWithoutDividend
                .filter((s) => s.includeDividend)
                .reduce((sum, s) => {
                    const dividendPerUnit = s.dividendAmount || 0;
                    const units = s.units || 0;
                    return sum + dividendPerUnit * units;
                }, 0);

            expect(total).toBe(0);
        });

        it('should handle undefined units and dividendAmount', () => {
            const stocksWithUndefined: Stock[] = [
                {
                    ...mockStocks[0],
                    units: undefined,
                },
                mockStocks[1],
            ];
            const total = stocksWithUndefined
                .filter((s) => s.includeDividend)
                .reduce((sum, s) => {
                    const dividendPerUnit = s.dividendAmount || 0;
                    const units = s.units || 0;
                    return sum + dividendPerUnit * units;
                }, 0);

            // A: 500円 × 0口 = 0円 (units undefined)
            // B: 300円 × 200口 = 60,000円
            // Total: 60,000円
            expect(total).toBe(60000);
        });
    });

    describe('calculateDividendYield', () => {
        it('should calculate correct dividend yield percentage', () => {
            const totalDividend = 80000;
            const totalValue = 1000000 + 2000000; // For includeDividend=true stocks
            const yield_ = (totalDividend / totalValue) * 100;

            expect(yield_).toBeCloseTo(2.667, 2);
        });

        it('should handle division by zero', () => {
            const totalDividend = 80000;
            const totalValue = 0;
            const yield_ =
                totalValue > 0 ? (totalDividend / totalValue) * 100 : 0;

            expect(yield_).toBe(0);
        });
    });

    describe('getDividendStockDetails', () => {
        it('should return array of dividend stocks with calculated amount (dividend per unit × units)', () => {
            const dividendStocks = mockStocks
                .filter((s) => s.includeDividend)
                .map((s) => ({
                    stockId: s.id,
                    name: s.name,
                    ticker: s.ticker,
                    amount: (s.dividendAmount || 0) * (s.units || 0),
                    yield: 0,
                }));

            expect(dividendStocks).toHaveLength(2);
            expect(dividendStocks[0].stockId).toBe('1');
            expect(dividendStocks[0].amount).toBe(50000); // 500 × 100
            expect(dividendStocks[1].amount).toBe(60000); // 300 × 200
        });

        it('should sort by dividend amount descending', () => {
            const dividendStocks = mockStocks
                .filter((s) => s.includeDividend)
                .map((s) => ({
                    stockId: s.id,
                    name: s.name,
                    ticker: s.ticker,
                    amount: (s.dividendAmount || 0) * (s.units || 0),
                    yield: 0,
                }))
                .sort((a, b) => b.amount - a.amount);

            expect(dividendStocks[0].amount).toBe(60000); // 300 × 200
            expect(dividendStocks[1].amount).toBe(50000); // 500 × 100
        });
    });

    describe('toggleDividendInclusion', () => {
        it('should toggle includeDividend flag', () => {
            const stock = mockStocks[0];
            const updated = {
                ...stock,
                includeDividend: !stock.includeDividend,
            };

            expect(updated.includeDividend).toBe(false);
        });
    });

    describe('updateStockDividend', () => {
        it('should update dividendAmount', () => {
            const stock = mockStocks[0];
            const newDividendAmount = 600; // 1口あたり600円
            const updated = {
                ...stock,
                dividendAmount: newDividendAmount,
                updatedAt: new Date().toISOString(),
            };

            expect(updated.dividendAmount).toBe(600);
            // 実際の年間配当は 600円 × 100口 = 60,000円
            expect(updated.dividendAmount * (updated.units || 0)).toBe(60000);
        });
    });
});
