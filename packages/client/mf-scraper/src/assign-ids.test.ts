import { describe, expect, it } from 'vitest';
import { assignIds } from './assign-ids.js';
import type { MFStock } from './scraper.js';

describe('assignIds', () => {
    it('シンプルなケース：重複なし', () => {
        const stocks: MFStock[] = [
            {
                id: '',
                name: 'Apple',
                account: 'SBI',
                units: 10,
                averageCost: 150,
                currentPrice: 160,
                value: 1600,
                profitLoss: 100,
            },
            {
                id: '',
                name: 'Google',
                account: 'SBI',
                units: 5,
                averageCost: 100,
                currentPrice: 120,
                value: 600,
                profitLoss: 100,
            },
        ];

        const result = assignIds(stocks);

        expect(result[0].id).toBe('Apple_SBI');
        expect(result[1].id).toBe('Google_SBI');
    });

    it('同一銘柄・同一金融機関の場合、_2, _3 をつける', () => {
        const stocks: MFStock[] = [
            {
                id: '',
                name: 'Apple',
                account: 'SBI',
                units: 10,
                averageCost: 150,
                currentPrice: 160,
                value: 1600,
                profitLoss: 100,
            },
            {
                id: '',
                name: 'Apple',
                account: 'SBI',
                units: 5,
                averageCost: 155,
                currentPrice: 160,
                value: 800,
                profitLoss: 25,
            },
            {
                id: '',
                name: 'Apple',
                account: 'SBI',
                units: 3,
                averageCost: 145,
                currentPrice: 160,
                value: 480,
                profitLoss: 45,
            },
        ];

        const result = assignIds(stocks);

        expect(result[0].id).toBe('Apple_SBI');
        expect(result[1].id).toBe('Apple_SBI_2');
        expect(result[2].id).toBe('Apple_SBI_3');
    });

    it('異なる金融機関の同一銘柄は異なる ID になる', () => {
        const stocks: MFStock[] = [
            {
                id: '',
                name: 'Apple',
                account: 'SBI',
                units: 10,
                averageCost: 150,
                currentPrice: 160,
                value: 1600,
                profitLoss: 100,
            },
            {
                id: '',
                name: 'Apple',
                account: '楽天',
                units: 5,
                averageCost: 155,
                currentPrice: 160,
                value: 800,
                profitLoss: 25,
            },
        ];

        const result = assignIds(stocks);

        expect(result[0].id).toBe('Apple_SBI');
        expect(result[1].id).toBe('Apple_楽天');
    });

    it('複雑なケース：複数の銘柄・複数の金融機関・一部重複', () => {
        const stocks: MFStock[] = [
            {
                id: '',
                name: 'Apple',
                account: 'SBI',
                units: 10,
                averageCost: 150,
                currentPrice: 160,
                value: 1600,
                profitLoss: 100,
            },
            {
                id: '',
                name: 'Google',
                account: 'SBI',
                units: 5,
                averageCost: 100,
                currentPrice: 120,
                value: 600,
                profitLoss: 100,
            },
            {
                id: '',
                name: 'Apple',
                account: 'SBI',
                units: 5,
                averageCost: 155,
                currentPrice: 160,
                value: 800,
                profitLoss: 25,
            },
            {
                id: '',
                name: 'Apple',
                account: '楽天',
                units: 3,
                averageCost: 145,
                currentPrice: 160,
                value: 480,
                profitLoss: 45,
            },
        ];

        const result = assignIds(stocks);

        expect(result[0].id).toBe('Apple_SBI');
        expect(result[1].id).toBe('Google_SBI');
        expect(result[2].id).toBe('Apple_SBI_2');
        expect(result[3].id).toBe('Apple_楽天');
    });
});
