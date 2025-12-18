import { getOne, runQuery } from '../database/connection.js';

interface RefreshTokenRow {
    id: number;
    user_id: number;
    token: string;
    expires_at: string;
    created_at: string;
}

export const findRefreshToken = (token: string, userId: number) => {
    return getOne<RefreshTokenRow>(
        'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ?',
        [token, userId]
    );
};

export const insertRefreshToken = (
    userId: number,
    token: string,
    expiresAt: Date
) => {
    return runQuery(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt.toISOString()]
    );
};

export const deleteRefreshToken = (token: string) => {
    return runQuery('DELETE FROM refresh_tokens WHERE token = ?', [token]);
};

export const deleteRefreshTokenById = (id: number) => {
    return runQuery('DELETE FROM refresh_tokens WHERE id = ?', [id]);
};
