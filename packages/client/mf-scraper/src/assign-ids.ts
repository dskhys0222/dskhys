import type { MFStock } from './scraper.js';

/**
 * MFStock に ID を割り当てる
 * 銘柄名_金融機関名 の形式でID を生成
 * 同じ組み合わせがある場合は _2, _3 などをつける
 */
export const assignIds = (stocks: Omit<MFStock, 'id'>[]): MFStock[] => {
    const idMap = new Map<string, number>();
    const result: MFStock[] = [];

    for (const stock of stocks) {
        const baseKey = `${stock.name}_${stock.account}`;

        // 出現回数をカウント
        const count = idMap.get(baseKey) ?? 0;
        idMap.set(baseKey, count + 1);

        // ID を生成
        let id = baseKey;
        if (count > 0) {
            id = `${baseKey}_${count + 1}`;
        }

        result.push({
            ...stock,
            id,
        });
    }

    return result;
};
