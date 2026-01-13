/** biome-ignore-all lint/style/noNonNullAssertion: テストなので緩和 */
import { describe, expect, it } from 'vitest';

interface MFStock {
    id?: string;
    name: string;
    account: string;
    units: number;
    averageCost: number;
    currentPrice: number;
    value: number;
    profitLoss: number;
}

/**
 * 同一銘柄・同一金融機関のストックを集約
 */
const aggregateStocksByNameAndAccount = (
    stocks: Omit<MFStock, 'id'>[]
): Omit<MFStock, 'id'>[] => {
    const grouped = new Map<string, Omit<MFStock, 'id'>[]>();

    for (const stock of stocks) {
        const key = `${stock.name}::${stock.account}`;
        if (!grouped.has(key)) {
            grouped.set(key, []);
        }
        grouped.get(key)!.push(stock);
    }

    const result: Omit<MFStock, 'id'>[] = [];

    for (const items of grouped.values()) {
        if (items.length === 1) {
            result.push(items[0]);
            continue;
        }

        const totalUnits = items.reduce((sum, item) => sum + item.units, 0);
        const totalValue = items.reduce((sum, item) => sum + item.value, 0);
        const totalProfitLoss = items.reduce(
            (sum, item) => sum + item.profitLoss,
            0
        );

        const totalCost = items.reduce(
            (sum, item) => sum + item.averageCost * item.units,
            0
        );
        const weightedAverageCost = totalUnits > 0 ? totalCost / totalUnits : 0;

        const currentPrice = items[0].currentPrice;

        result.push({
            name: items[0].name,
            account: items[0].account,
            units: totalUnits,
            averageCost: weightedAverageCost,
            currentPrice,
            value: totalValue,
            profitLoss: totalProfitLoss,
        });
    }

    return result;
};

describe('aggregateStocksByNameAndAccount', () => {
    it('重複がない場合はそのまま返す', () => {
        const stocks: Omit<MFStock, 'id'>[] = [
            {
                name: 'Apple',
                account: 'SBI',
                units: 10,
                averageCost: 150,
                currentPrice: 160,
                value: 1600,
                profitLoss: 100,
            },
            {
                name: 'Google',
                account: 'SBI',
                units: 5,
                averageCost: 100,
                currentPrice: 120,
                value: 600,
                profitLoss: 100,
            },
        ];

        const result = aggregateStocksByNameAndAccount(stocks);

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('Apple');
        expect(result[1].name).toBe('Google');
    });

    it('同一銘柄・同一金融機関は合計する', () => {
        const stocks: Omit<MFStock, 'id'>[] = [
            {
                name: 'Apple',
                account: 'SBI',
                units: 10,
                averageCost: 150,
                currentPrice: 160,
                value: 1600,
                profitLoss: 100,
            },
            {
                name: 'Apple',
                account: 'SBI',
                units: 5,
                averageCost: 160,
                currentPrice: 160,
                value: 800,
                profitLoss: 50,
            },
        ];

        const result = aggregateStocksByNameAndAccount(stocks);

        expect(result).toHaveLength(1);
        expect(result[0].units).toBe(15); // 10 + 5
        expect(result[0].value).toBe(2400); // 1600 + 800
        expect(result[0].profitLoss).toBe(150); // 100 + 50
    });

    it('加重平均で平均取得単価を計算する', () => {
        const stocks: Omit<MFStock, 'id'>[] = [
            {
                name: 'Apple',
                account: 'SBI',
                units: 10,
                averageCost: 150,
                currentPrice: 160,
                value: 1600,
                profitLoss: 100,
            },
            {
                name: 'Apple',
                account: 'SBI',
                units: 10,
                averageCost: 160,
                currentPrice: 160,
                value: 1600,
                profitLoss: 100,
            },
        ];

        const result = aggregateStocksByNameAndAccount(stocks);

        expect(result).toHaveLength(1);
        // (150 * 10 + 160 * 10) / 20 = (1500 + 1600) / 20 = 155
        expect(result[0].averageCost).toBe(155);
    });

    it('複数銘柄の場合は銘柄ごとに集約', () => {
        const stocks: Omit<MFStock, 'id'>[] = [
            {
                name: 'Apple',
                account: 'SBI',
                units: 10,
                averageCost: 150,
                currentPrice: 160,
                value: 1600,
                profitLoss: 100,
            },
            {
                name: 'Apple',
                account: 'SBI',
                units: 5,
                averageCost: 160,
                currentPrice: 160,
                value: 800,
                profitLoss: 50,
            },
            {
                name: 'Google',
                account: 'SBI',
                units: 20,
                averageCost: 100,
                currentPrice: 120,
                value: 2400,
                profitLoss: 400,
            },
        ];

        const result = aggregateStocksByNameAndAccount(stocks);

        expect(result).toHaveLength(2);

        // Apple: 合計 15 単位
        const apple = result.find((s) => s.name === 'Apple');
        expect(apple).toBeDefined();
        expect(apple!.units).toBe(15);
        expect(apple!.value).toBe(2400);

        // Google: 20 単位（変わらず）
        const google = result.find((s) => s.name === 'Google');
        expect(google).toBeDefined();
        expect(google!.units).toBe(20);
        expect(google!.value).toBe(2400);
    });

    it('異なる金融機関の同一銘柄は別々に集約', () => {
        const stocks: Omit<MFStock, 'id'>[] = [
            {
                name: 'Apple',
                account: 'SBI',
                units: 10,
                averageCost: 150,
                currentPrice: 160,
                value: 1600,
                profitLoss: 100,
            },
            {
                name: 'Apple',
                account: 'SBI',
                units: 5,
                averageCost: 160,
                currentPrice: 160,
                value: 800,
                profitLoss: 50,
            },
            {
                name: 'Apple',
                account: '楽天',
                units: 3,
                averageCost: 145,
                currentPrice: 160,
                value: 480,
                profitLoss: 45,
            },
        ];

        const result = aggregateStocksByNameAndAccount(stocks);

        expect(result).toHaveLength(2);

        // SBI: 15 単位
        const sbi = result.find((s) => s.account === 'SBI');
        expect(sbi!.units).toBe(15);

        // 楽天: 3 単位
        const rakuten = result.find((s) => s.account === '楽天');
        expect(rakuten!.units).toBe(3);
    });
});
