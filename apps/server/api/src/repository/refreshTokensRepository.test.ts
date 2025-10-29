import { ResultAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as connection from '../database/connection';
import { InternalServerError } from '../utils/errors';
import {
  deleteRefreshToken,
  deleteRefreshTokenById,
  findRefreshToken,
  insertRefreshToken,
} from './refreshTokensRepository';

// connection モジュールをモック
vi.mock('../database/connection');

describe('refreshTokensRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findRefreshToken', () => {
    it('トークンとユーザーIDでリフレッシュトークンを検索できる', async () => {
      const mockToken = {
        id: 1,
        user_id: 1,
        token: 'refresh_token_abc123',
        expires_at: '2024-12-31T23:59:59.000Z',
        created_at: '2024-01-01T00:00:00.000Z',
      };

      vi.spyOn(connection, 'getOne').mockReturnValue(
        ResultAsync.fromSafePromise(Promise.resolve(mockToken))
      );

      const result = await findRefreshToken('refresh_token_abc123', 1);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(mockToken);
      }

      expect(connection.getOne).toHaveBeenCalledWith(
        'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ?',
        ['refresh_token_abc123', 1]
      );
    });

    it('トークンが見つからない場合はnullを返す', async () => {
      vi.spyOn(connection, 'getOne').mockReturnValue(
        ResultAsync.fromSafePromise(Promise.resolve(null))
      );

      const result = await findRefreshToken('invalid_token', 1);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });

    it('データベースエラーの場合はエラーを返す', async () => {
      const dbError = new InternalServerError('Database error');

      vi.spyOn(connection, 'getOne').mockReturnValue(
        ResultAsync.fromPromise(Promise.reject(dbError), () => dbError)
      );

      const result = await findRefreshToken('token', 1);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toEqual(dbError);
      }
    });
  });

  describe('insertRefreshToken', () => {
    it('新しいリフレッシュトークンを挿入できる', async () => {
      const mockResult = { changes: 1 };
      const expiresAt = new Date('2024-12-31T23:59:59.000Z');

      vi.spyOn(connection, 'runQuery').mockReturnValue(
        ResultAsync.fromSafePromise(Promise.resolve(mockResult))
      );

      const result = await insertRefreshToken(
        1,
        'refresh_token_abc123',
        expiresAt
      );

      expect(result.isOk()).toBe(true);

      expect(connection.runQuery).toHaveBeenCalledWith(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [1, 'refresh_token_abc123', expiresAt.toISOString()]
      );
    });

    it('データベースエラーの場合はエラーを返す', async () => {
      const dbError = new InternalServerError('Unique constraint failed');
      const expiresAt = new Date('2024-12-31T23:59:59.000Z');

      vi.spyOn(connection, 'runQuery').mockReturnValue(
        ResultAsync.fromPromise(Promise.reject(dbError), () => dbError)
      );

      const result = await insertRefreshToken(1, 'token', expiresAt);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toEqual(dbError);
      }
    });
  });

  describe('deleteRefreshToken', () => {
    it('トークンでリフレッシュトークンを削除できる', async () => {
      const mockResult = { changes: 1 };

      vi.spyOn(connection, 'runQuery').mockReturnValue(
        ResultAsync.fromSafePromise(Promise.resolve(mockResult))
      );

      const result = await deleteRefreshToken('refresh_token_abc123');

      expect(result.isOk()).toBe(true);

      expect(connection.runQuery).toHaveBeenCalledWith(
        'DELETE FROM refresh_tokens WHERE token = ?',
        ['refresh_token_abc123']
      );
    });

    it('データベースエラーの場合はエラーを返す', async () => {
      const dbError = new InternalServerError('Database error');

      vi.spyOn(connection, 'runQuery').mockReturnValue(
        ResultAsync.fromPromise(Promise.reject(dbError), () => dbError)
      );

      const result = await deleteRefreshToken('token');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toEqual(dbError);
      }
    });
  });

  describe('deleteRefreshTokenById', () => {
    it('IDでリフレッシュトークンを削除できる', async () => {
      const mockResult = { changes: 1 };

      vi.spyOn(connection, 'runQuery').mockReturnValue(
        ResultAsync.fromSafePromise(Promise.resolve(mockResult))
      );

      const result = await deleteRefreshTokenById(1);

      expect(result.isOk()).toBe(true);

      expect(connection.runQuery).toHaveBeenCalledWith(
        'DELETE FROM refresh_tokens WHERE id = ?',
        [1]
      );
    });

    it('データベースエラーの場合はエラーを返す', async () => {
      const dbError = new InternalServerError('Database error');

      vi.spyOn(connection, 'runQuery').mockReturnValue(
        ResultAsync.fromPromise(Promise.reject(dbError), () => dbError)
      );

      const result = await deleteRefreshTokenById(1);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toEqual(dbError);
      }
    });
  });

  describe('統合テスト', () => {
    it('トークンのライフサイクル全体が正しく動作する', async () => {
      const expiresAt = new Date('2024-12-31T23:59:59.000Z');

      // トークン挿入
      vi.spyOn(connection, 'runQuery').mockReturnValue(
        ResultAsync.fromSafePromise(Promise.resolve({ changes: 1 }))
      );

      const insertResult = await insertRefreshToken(1, 'token123', expiresAt);
      expect(insertResult.isOk()).toBe(true);

      // トークン検索
      const mockToken = {
        id: 1,
        user_id: 1,
        token: 'token123',
        expires_at: expiresAt.toISOString(),
        created_at: '2024-01-01T00:00:00.000Z',
      };

      vi.spyOn(connection, 'getOne').mockReturnValue(
        ResultAsync.fromSafePromise(Promise.resolve(mockToken))
      );

      const findResult = await findRefreshToken('token123', 1);
      expect(findResult.isOk()).toBe(true);

      // トークン削除
      vi.spyOn(connection, 'runQuery').mockReturnValue(
        ResultAsync.fromSafePromise(Promise.resolve({ changes: 1 }))
      );

      const deleteResult = await deleteRefreshToken('token123');
      expect(deleteResult.isOk()).toBe(true);
    });
  });
});
