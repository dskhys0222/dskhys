import { ResultAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as connection from '../database/connection.js';
import { InternalServerError } from '../utils/errors.js';
import { findUserByEmail, findUserById, insertUser } from './usersRepository.js';

// connection モジュールをモック
vi.mock('../database/connection');

describe('usersRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findUserByEmail', () => {
    it('メールアドレスでユーザーを検索できる', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      vi.spyOn(connection, 'getOne').mockReturnValue(
        ResultAsync.fromSafePromise(Promise.resolve(mockUser))
      );

      const result = await findUserByEmail('test@example.com');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(mockUser);
      }

      expect(connection.getOne).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['test@example.com']
      );
    });

    it('ユーザーが見つからない場合はnullを返す', async () => {
      vi.spyOn(connection, 'getOne').mockReturnValue(
        ResultAsync.fromSafePromise(Promise.resolve(null))
      );

      const result = await findUserByEmail('notfound@example.com');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });

    it('データベースエラーの場合はエラーを返す', async () => {
      const dbError = new InternalServerError('Database connection failed');

      vi.spyOn(connection, 'getOne').mockReturnValue(
        ResultAsync.fromPromise(Promise.reject(dbError), () => dbError)
      );

      const result = await findUserByEmail('test@example.com');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toEqual(dbError);
      }
    });
  });

  describe('findUserById', () => {
    it('IDでユーザーを検索できる', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      };

      vi.spyOn(connection, 'getOne').mockReturnValue(
        ResultAsync.fromSafePromise(Promise.resolve(mockUser))
      );

      const result = await findUserById(1);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(mockUser);
      }

      expect(connection.getOne).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        [1]
      );
    });

    it('ユーザーが見つからない場合はnullを返す', async () => {
      vi.spyOn(connection, 'getOne').mockReturnValue(
        ResultAsync.fromSafePromise(Promise.resolve(null))
      );

      const result = await findUserById(999);

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

      const result = await findUserById(1);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toEqual(dbError);
      }
    });
  });

  describe('insertUser', () => {
    it('新しいユーザーを挿入できる', async () => {
      const mockResult = { lastID: 1 };

      vi.spyOn(connection, 'runQuery').mockReturnValue(
        ResultAsync.fromSafePromise(Promise.resolve(mockResult))
      );

      const result = await insertUser(
        'New User',
        'new@example.com',
        'hashed_password'
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(mockResult);
        expect(result.value.lastID).toBe(1);
      }

      expect(connection.runQuery).toHaveBeenCalledWith(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        ['New User', 'new@example.com', 'hashed_password']
      );
    });

    it('データベースエラーの場合はエラーを返す', async () => {
      const dbError = new InternalServerError('Unique constraint failed');

      vi.spyOn(connection, 'runQuery').mockReturnValue(
        ResultAsync.fromPromise(Promise.reject(dbError), () => dbError)
      );

      const result = await insertUser(
        'Test User',
        'test@example.com',
        'hashed_password'
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toEqual(dbError);
      }
    });
  });
});
