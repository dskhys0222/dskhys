import { runQuery } from '../database/connection';

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
