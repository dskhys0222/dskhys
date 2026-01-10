import { describe, expect, it } from 'vitest';
import {
    calculateCost,
    calculateMarketValue,
    calculateProfit,
    calculateProfitRate,
} from './calculations';

describe('calculations', () => {
    describe('calculateMarketValue', () => {
        it('正しく評価額を計算する', () => {
            expect(calculateMarketValue(100, 150)).toBe(15000);
            expect(calculateMarketValue(50, 200.5)).toBe(10025);
            expect(calculateMarketValue(0, 100)).toBe(0);
        });

        it('小数点を含む計算を正しく処理する', () => {
            expect(calculateMarketValue(33.5, 120.75)).toBeCloseTo(4045.125);
        });
    });

    describe('calculateCost', () => {
        it('正しく取得コストを計算する', () => {
            expect(calculateCost(100, 120)).toBe(12000);
            expect(calculateCost(50, 150.5)).toBe(7525);
            expect(calculateCost(0, 100)).toBe(0);
        });
    });

    describe('calculateProfit', () => {
        it('利益が出ている場合に正しく計算する', () => {
            // 100株 × (150 - 120) = 3000の利益
            expect(calculateProfit(100, 150, 120)).toBe(3000);
        });

        it('損失が出ている場合に正しく計算する', () => {
            // 100株 × (100 - 120) = -2000の損失
            expect(calculateProfit(100, 100, 120)).toBe(-2000);
        });

        it('損益がゼロの場合を正しく計算する', () => {
            expect(calculateProfit(100, 120, 120)).toBe(0);
        });

        it('株数がゼロの場合を正しく計算する', () => {
            expect(calculateProfit(0, 150, 120)).toBe(0);
        });

        it('小数点を含む計算を正しく処理する', () => {
            expect(calculateProfit(33.5, 120.75, 100)).toBeCloseTo(695.125);
        });
    });

    describe('calculateProfitRate', () => {
        it('利益率を正しく計算する', () => {
            // 3000 / 12000 * 100 = 25%
            expect(calculateProfitRate(3000, 12000)).toBe(25);
        });

        it('損失率を正しく計算する', () => {
            // -2000 / 12000 * 100 = -16.666...%
            expect(calculateProfitRate(-2000, 12000)).toBeCloseTo(
                -16.666666666666668
            );
        });

        it('損益がゼロの場合を正しく計算する', () => {
            expect(calculateProfitRate(0, 12000)).toBe(0);
        });

        it('コストがゼロの場合はゼロを返す', () => {
            expect(calculateProfitRate(1000, 0)).toBe(0);
        });

        it('小数点を含む計算を正しく処理する', () => {
            expect(calculateProfitRate(695.125, 3350)).toBeCloseTo(20.75);
        });
    });
});
