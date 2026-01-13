import { z } from 'zod';
import { ACCOUNTS, ASSET_CLASSES, ATTRIBUTES, REGIONS } from '@/types';

// 空文字やNaNをundefinedに変換するpreprocessor
const optionalNumber = z.preprocess((val) => {
    if (val === '' || val === undefined || val === null) return undefined;
    if (typeof val === 'number' && Number.isNaN(val)) return undefined;
    return val;
}, z.number().nonnegative('0以上で入力してください').optional());

export const stockSchema = z.object({
    name: z
        .string()
        .min(1, '銘柄名は必須です')
        .max(100, '銘柄名は100文字以内で入力してください'),
    ticker: z
        .string()
        .min(1, 'ティッカーは必須です')
        .max(20, 'ティッカーは20文字以内で入力してください'),
    value: z
        .number({ invalid_type_error: '評価額は数値で入力してください' })
        .nonnegative('評価額は0以上で入力してください'),
    currentPrice: optionalNumber,
    units: optionalNumber,
    averageCost: optionalNumber,
    assetClass: z.enum(ASSET_CLASSES, {
        errorMap: () => ({ message: 'クラスを選択してください' }),
    }),
    region: z.enum(REGIONS, {
        errorMap: () => ({ message: '地域を選択してください' }),
    }),
    attribute: z.enum(ATTRIBUTES, {
        errorMap: () => ({ message: '属性を選択してください' }),
    }),
    account: z.enum(ACCOUNTS, {
        errorMap: () => ({ message: '口座を選択してください' }),
    }),
    note: z.string().max(500, '備考は500文字以内で入力してください').optional(),
});

export type StockFormData = z.infer<typeof stockSchema>;
