import { getOne, runQuery } from '../database/connection.js';
import type { EncryptedPortfolio } from '../schemas/index.js';

/**
 * 暗号化ポートフォリオを作成または更新（Upsert）
 */
export const upsertEncryptedPortfolio = (
    userId: number,
    iv: string,
    encryptedData: string,
    authTag: string,
    scrapedAt: string
) => {
    return runQuery(
        `INSERT INTO encrypted_portfolios (user_id, iv, encrypted_data, auth_tag, scraped_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           iv = excluded.iv,
           encrypted_data = excluded.encrypted_data,
           auth_tag = excluded.auth_tag,
           scraped_at = excluded.scraped_at,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, iv, encryptedData, authTag, scrapedAt]
    );
};

/**
 * ユーザーIDで暗号化ポートフォリオを取得
 */
export const findEncryptedPortfolioByUserId = (userId: number) => {
    return getOne<EncryptedPortfolio>(
        'SELECT * FROM encrypted_portfolios WHERE user_id = ?',
        [userId]
    );
};
