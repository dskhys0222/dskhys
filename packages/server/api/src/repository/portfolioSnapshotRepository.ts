import { getOne, runQuery } from '../database/connection.js';
import type { PortfolioSnapshot } from '../schemas/index.js';

/**
 * ユーザーIDでポートフォリオスナップショットを取得
 */
export const getPortfolioSnapshot = (userId: number) => {
    return getOne<PortfolioSnapshot>(
        'SELECT * FROM portfolio_snapshots WHERE user_id = ?',
        [userId]
    );
};

/**
 * ポートフォリオスナップショットを作成または更新（Upsert）
 */
export const upsertPortfolioSnapshot = (
    userId: number,
    iv: string,
    encryptedData: string,
    authTag: string
) => {
    return runQuery(
        `INSERT INTO portfolio_snapshots (user_id, iv, encrypted_data, auth_tag)
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
 * ポートフォリオスナップショットを削除
 */
export const deletePortfolioSnapshot = (userId: number) => {
    return runQuery('DELETE FROM portfolio_snapshots WHERE user_id = ?', [
        userId,
    ]);
};
