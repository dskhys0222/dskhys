import { describe, expect, it } from 'vitest';
import type { Stock } from '@/types';
import { aggregateByField, calculateTotalValue } from './aggregation';

const mockStocks: Stock[] = [
    {
        id: '1',
        name: 'Vanguard Total Stock Market ETF',
        ticker: 'VTI',
        value: 25000,
        units: 100,
        averageCost: 200,
        assetClass: '株式',
        region: '米国',
        attribute: 'インデックス',
        account: '特定',
        source: 'manual',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'Vanguard S&P 500 ETF',
        ticker: 'VOO',
        value: 18000,
        units: 50,
        averageCost: 300,
        assetClass: '株式',
        region: '米国',
        attribute: 'インデックス',
        account: 'NISA',
        source: 'manual',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '3',
        name: '現金',
        ticker: 'CASH',
        value: 15000,
        assetClass: '現金',
        region: '日本',
        attribute: '現金',
        account: '預金',
        source: 'manual',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

describe('aggregation', () => {
    describe('aggregateByField', () => {
        it('クラス別に正しく集計する', () => {
            const result = aggregateByField(mockStocks, 'assetClass');

            expect(result).toHaveLength(2);

            const stocks = result.find((r) => r.name === '株式');
            expect(stocks).toEqual({
                name: '株式',
                value: 43000, // VTI: 25000 + VOO: 18000
                percentage: 74.1, // 43000 / 58000 * 100
            });

            const cash = result.find((r) => r.name === '現金');
            expect(cash).toEqual({
                name: '現金',
                value: 15000,
                percentage: 25.9, // 15000 / 58000 * 100
            });
        });

        it('地域別に正しく集計する', () => {
            const result = aggregateByField(mockStocks, 'region');

            expect(result).toHaveLength(2);

            const us = result.find((r) => r.name === '米国');
            expect(us).toEqual({
                name: '米国',
                value: 43000,
                percentage: 74.1,
            });

            const jp = result.find((r) => r.name === '日本');
            expect(jp).toEqual({
                name: '日本',
                value: 15000,
                percentage: 25.9,
            });
        });

        it('口座別に正しく集計する', () => {
            const result = aggregateByField(mockStocks, 'account');

            expect(result).toHaveLength(3);

            const tokutei = result.find((r) => r.name === '特定');
            expect(tokutei).toEqual({
                name: '特定',
                value: 25000,
                percentage: 43.1,
            });

            const nisa = result.find((r) => r.name === 'NISA');
            expect(nisa).toEqual({
                name: 'NISA',
                value: 18000,
                percentage: 31.0,
            });

            const yokin = result.find((r) => r.name === '預金');
            expect(yokin).toEqual({
                name: '預金',
                value: 15000,
                percentage: 25.9,
            });
        });

        it('空の配列で空配列を返す', () => {
            const result = aggregateByField([], 'assetClass');
            expect(result).toEqual([]);
        });
    });

    describe('calculateTotalValue', () => {
        it('総評価額を正しく計算する', () => {
            const result = calculateTotalValue(mockStocks);
            expect(result).toBe(58000); // 25000 + 18000 + 15000
        });

        it('空の配列でゼロを返す', () => {
            const result = calculateTotalValue([]);
            expect(result).toBe(0);
        });
    });
});
