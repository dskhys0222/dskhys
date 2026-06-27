import { getOne, runQuery } from '../database/connection.js';
import type { BudgetSnapshot } from '../schemas/index.js';

/**
 * ユーザーIDでバジェットスナップショットを取得
 */
export const getBudgetSnapshot = (userId: number) => {
    return getOne<BudgetSnapshot>(
        'SELECT * FROM budget_snapshots WHERE user_id = ?',
        [userId]
    );
};

/**
 * バジェットスナップショットを作成または更新（Upsert）
 */
export const upsertBudgetSnapshot = (
    userId: number,
    iv: string,
    encryptedData: string,
    authTag: string
) => {
    return runQuery(
        `INSERT INTO budget_snapshots (user_id, iv, encrypted_data, auth_tag)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           iv = excluded.iv,
           encrypted_data = excluded.encrypted_data,
           auth_tag = excluded.auth_tag,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, iv, encryptedData, authTag]
    );
};

/**
 * バジェットスナップショットを削除
 */
export const deleteBudgetSnapshot = (userId: number) => {
    return runQuery('DELETE FROM budget_snapshots WHERE user_id = ?', [userId]);
};
