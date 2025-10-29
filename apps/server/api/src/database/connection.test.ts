import { beforeEach, describe, expect, it, vi } from 'vitest';
import { closeDatabase, getMany, getOne, runQuery } from './connection';

describe('Database Connection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('runQuery', () => {
    it('クエリを実行できる', async () => {
      const result = await runQuery('SELECT 1 as value');

      expect(result.isOk()).toBe(true);
    });

    it('無効なSQLの場合はエラーを返す', async () => {
      const result = await runQuery('INVALID SQL QUERY');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.statusCode).toBe(500);
      }
    });
  });

  describe('getOne', () => {
    it('1件のデータを取得できる', async () => {
      const result = await getOne<{ value: number }>('SELECT 1 as value');

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toMatchObject({ value: 1 });
      }
    });

    it('データが存在しない場合はnullまたはundefinedを返す', async () => {
      const result = await getOne('SELECT * FROM users WHERE id = ?', [99999]);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // SQLiteはundefinedを返すこともある
        expect(result.value == null).toBe(true);
      }
    });

    it('無効なSQLの場合はエラーを返す', async () => {
      const result = await getOne('INVALID SQL');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.statusCode).toBe(500);
      }
    });
  });

  describe('getMany', () => {
    it('複数のデータを取得できる', async () => {
      // テスト用のテーブルを作成してデータを挿入
      await runQuery(`
        CREATE TEMPORARY TABLE test_items (
          id INTEGER PRIMARY KEY,
          value TEXT
        )
      `);

      await runQuery('INSERT INTO test_items (value) VALUES (?)', ['test1']);
      await runQuery('INSERT INTO test_items (value) VALUES (?)', ['test2']);

      const result = await getMany<{ id: number; value: string }>(
        'SELECT * FROM test_items'
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('データが存在しない場合は空配列を返す', async () => {
      const result = await getMany('SELECT * FROM users WHERE id = ?', [99999]);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual([]);
      }
    });

    it('無効なSQLの場合はエラーを返す', async () => {
      const result = await getMany('INVALID SQL');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.statusCode).toBe(500);
      }
    });
  });

  describe('closeDatabase', () => {
    it('データベース接続を閉じることができる', async () => {
      // この時点でDBは開いている
      const result = await closeDatabase();

      // 接続が閉じられたことを確認
      expect(result.isOk()).toBe(true);
    });
  });
});
