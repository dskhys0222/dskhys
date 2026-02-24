import { describe, expect, it } from 'vitest';
import type { Stock } from '@/types';
import { calculateTotalValue } from './aggregation';

const mockStocks: Stock[] = [
    {
        id: '1',
        name: 'Vanguard Total Stock Market ETF',
        ticker: 'VTI',
        value: 25000,
        units: 100,
        averageCost: 200,
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
        source: 'manual',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '3',
        name: '現金',
        ticker: 'CASH',
        value: 15000,
        source: 'manual',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

describe('aggregation', () => {
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
