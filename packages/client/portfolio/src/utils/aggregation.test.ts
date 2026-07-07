import { describe, expect, it } from 'vitest';
import type { CustomAggregation, Stock } from '@/types';
import { aggregateCustom, calculateTotalValue } from './aggregation';

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

// ─── aggregateCustom テスト用データ ─────────────────────────────────

const stockWithCost = (
    id: string,
    value: number,
    units: number,
    averageCost: number
): Stock => ({
    id,
    source: 'manual',
    name: `銘柄${id}`,
    ticker: `T${id}`,
    value,
    units,
    averageCost,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
});

const stockWithoutCost = (id: string, value: number): Stock => ({
    id,
    source: 'manual',
    name: `銘柄${id}`,
    ticker: `T${id}`,
    value,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
});

const makeAggregation = (
    attrs: { name: string; targetRatio?: number }[],
    assignments: { stockId: string; attributeName: string }[]
): CustomAggregation => ({
    id: 'agg1',
    name: 'テスト集計',
    attributes: attrs.map((a) => ({ color: '#000', ...a })),
    stockAssignments: assignments,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
});

describe('aggregateCustom', () => {
    it('基本的な集計: profitLoss と profitLossRate が正しく計算される', () => {
        // value=25000, cost=100*200=20000 → profitLoss=+5000, rate=25%
        const stocks = [stockWithCost('1', 25000, 100, 200)];
        const aggregation = makeAggregation(
            [{ name: 'コア' }],
            [{ stockId: '1', attributeName: 'コア' }]
        );

        const result = aggregateCustom(stocks, aggregation);

        expect(result).toHaveLength(1);
        expect(result[0].profitLoss).toBe(5000);
        expect(result[0].profitLossRate).toBeCloseTo(25);
    });

    it('損失の場合: profitLoss が負の値になる', () => {
        // value=8000, cost=100*100=10000 → profitLoss=-2000, rate=-20%
        const stocks = [stockWithCost('1', 8000, 100, 100)];
        const aggregation = makeAggregation(
            [{ name: 'コア' }],
            [{ stockId: '1', attributeName: 'コア' }]
        );

        const result = aggregateCustom(stocks, aggregation);

        expect(result[0].profitLoss).toBe(-2000);
        expect(result[0].profitLossRate).toBeCloseTo(-20);
    });

    it('取得原価なし: profitLoss が undefined になる', () => {
        const stocks = [stockWithoutCost('1', 15000)];
        const aggregation = makeAggregation(
            [{ name: 'キャッシュ' }],
            [{ stockId: '1', attributeName: 'キャッシュ' }]
        );

        const result = aggregateCustom(stocks, aggregation);

        expect(result[0].profitLoss).toBeUndefined();
        expect(result[0].profitLossRate).toBeUndefined();
    });

    it('取得原価あり・なし混在: 取得原価がある銘柄のみ損益を集計する', () => {
        // stockA: value=12000, cost=10000 → profitLoss=+2000
        // stockB: 原価なし → 損益計算に含まれない
        const stocks = [
            stockWithCost('A', 12000, 100, 100),
            stockWithoutCost('B', 5000),
        ];
        const aggregation = makeAggregation(
            [{ name: 'グループ' }],
            [
                { stockId: 'A', attributeName: 'グループ' },
                { stockId: 'B', attributeName: 'グループ' },
            ]
        );

        const result = aggregateCustom(stocks, aggregation);

        expect(result[0].value).toBe(17000);
        expect(result[0].profitLoss).toBe(2000);
        // cost=10000 のみを分母に使う
        expect(result[0].profitLossRate).toBeCloseTo(20);
    });

    it('複数銘柄のグループ: 同じグループの損益を合算する', () => {
        // stockA: value=12000, cost=10000 → +2000
        // stockB: value=8000, cost=9000  → -1000
        // 合計 profitLoss=+1000, cost=19000, rate≈5.26%
        const stocks = [
            stockWithCost('A', 12000, 100, 100),
            stockWithCost('B', 8000, 90, 100),
        ];
        const aggregation = makeAggregation(
            [{ name: 'コア' }],
            [
                { stockId: 'A', attributeName: 'コア' },
                { stockId: 'B', attributeName: 'コア' },
            ]
        );

        const result = aggregateCustom(stocks, aggregation);

        expect(result[0].profitLoss).toBe(1000);
        expect(result[0].profitLossRate).toBeCloseTo((1000 / 19000) * 100);
    });

    it('空の集計（銘柄なし）: 空配列を返す', () => {
        const aggregation = makeAggregation([{ name: 'コア' }], []);

        const result = aggregateCustom([], aggregation);

        expect(result).toHaveLength(0);
    });

    it('割り当てなし銘柄のフィルタリング: value=0 の属性は結果に含まれない', () => {
        const stocks = [stockWithCost('1', 10000, 50, 100)];
        // 銘柄1は「コア」に割り当て、「サテライト」には割り当てなし → value=0 でフィルタ
        const aggregation = makeAggregation(
            [{ name: 'コア' }, { name: 'サテライト' }],
            [{ stockId: '1', attributeName: 'コア' }]
        );

        const result = aggregateCustom(stocks, aggregation);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('コア');
    });
});
