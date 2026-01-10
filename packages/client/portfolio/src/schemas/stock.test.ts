import { describe, expect, it } from 'vitest';
import { stockSchema } from './stock';

describe('schemas', () => {
    describe('stockSchema', () => {
        it('有効なデータをバリデーションする', () => {
            const validData = {
                name: 'Vanguard Total Stock Market ETF',
                ticker: 'VTI',
                value: 25000,
                units: 100,
                averageCost: 200,
                assetClass: '株式' as const,
                region: '米国' as const,
                attribute: 'インデックス' as const,
                account: '特定' as const,
                note: 'メモ',
            };

            const result = stockSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validData);
            }
        });

        it('必須フィールドのみでバリデーションが通る', () => {
            const validData = {
                name: 'Test Stock',
                ticker: 'TEST',
                value: 10000,
                assetClass: '株式' as const,
                region: '日本' as const,
                attribute: '増配' as const,
                account: 'NISA' as const,
            };

            const result = stockSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('必須フィールドが欠けている場合はエラーを返す', () => {
            const invalidData = {
                ticker: 'VTI',
                // nameが欠けている
                value: 25000,
                assetClass: '株式' as const,
                region: '米国' as const,
                attribute: 'インデックス' as const,
                account: '特定' as const,
            };

            const result = stockSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].path).toContain('name');
            }
        });

        it('ティッカーが空の場合はエラーを返す', () => {
            const invalidData = {
                name: 'Test',
                ticker: '',
                value: 25000,
                assetClass: '株式' as const,
                region: '米国' as const,
                attribute: 'インデックス' as const,
                account: '特定' as const,
            };

            const result = stockSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toBe(
                    'ティッカーは必須です'
                );
            }
        });

        it('ティッカーが20文字を超える場合はエラーを返す', () => {
            const invalidData = {
                name: 'Test',
                ticker: 'A'.repeat(21),
                value: 25000,
                assetClass: '株式' as const,
                region: '米国' as const,
                attribute: 'インデックス' as const,
                account: '特定' as const,
            };

            const result = stockSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toBe(
                    'ティッカーは20文字以内で入力してください'
                );
            }
        });

        it('評価額が負の数の場合はエラーを返す', () => {
            const invalidData = {
                name: 'Test',
                ticker: 'VTI',
                value: -100,
                assetClass: '株式' as const,
                region: '米国' as const,
                attribute: 'インデックス' as const,
                account: '特定' as const,
            };

            const result = stockSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toBe(
                    '評価額は0以上で入力してください'
                );
            }
        });

        it('無効なクラスの場合はエラーを返す', () => {
            const invalidData = {
                name: 'Test',
                ticker: 'VTI',
                value: 25000,
                assetClass: '無効なクラス',
                region: '米国' as const,
                attribute: 'インデックス' as const,
                account: '特定' as const,
            };

            const result = stockSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toBe(
                    'クラスを選択してください'
                );
            }
        });

        it('無効な地域の場合はエラーを返す', () => {
            const invalidData = {
                name: 'Test',
                ticker: 'VTI',
                value: 25000,
                assetClass: '株式' as const,
                region: '無効な地域',
                attribute: 'インデックス' as const,
                account: '特定' as const,
            };

            const result = stockSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toBe(
                    '地域を選択してください'
                );
            }
        });

        it('無効な属性の場合はエラーを返す', () => {
            const invalidData = {
                name: 'Test',
                ticker: 'VTI',
                value: 25000,
                assetClass: '株式' as const,
                region: '米国' as const,
                attribute: '無効な属性',
                account: '特定' as const,
            };

            const result = stockSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toBe(
                    '属性を選択してください'
                );
            }
        });

        it('無効な口座の場合はエラーを返す', () => {
            const invalidData = {
                name: 'Test',
                ticker: 'VTI',
                value: 25000,
                assetClass: '株式' as const,
                region: '米国' as const,
                attribute: 'インデックス' as const,
                account: '無効な口座',
            };

            const result = stockSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toBe(
                    '口座を選択してください'
                );
            }
        });

        it('備考が500文字を超える場合はエラーを返す', () => {
            const invalidData = {
                name: 'Test',
                ticker: 'VTI',
                value: 25000,
                assetClass: '株式' as const,
                region: '米国' as const,
                attribute: 'インデックス' as const,
                account: '特定' as const,
                note: 'A'.repeat(501),
            };

            const result = stockSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toBe(
                    '備考は500文字以内で入力してください'
                );
            }
        });
    });
});
