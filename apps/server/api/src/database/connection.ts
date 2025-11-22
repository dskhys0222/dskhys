import { ResultAsync } from 'neverthrow';
import { InternalServerError } from '../utils/errors.js';
import { getDatabase } from './db-instance.js';

// データベースの初期化
const initializeDatabase = (): void => {
  // ユーザーテーブル
  runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).match(
    () => {
      console.log('usersテーブルの初期化が完了しました');
      // リフレッシュトークンテーブル
      runQuery(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `).match(
        () => {
          console.log('refresh_tokensテーブルの初期化が完了しました');
          // リストアイテムテーブル
          runQuery(`
            CREATE TABLE IF NOT EXISTS list_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              owner_id INTEGER NOT NULL,
              key TEXT NOT NULL UNIQUE,
              data TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
            )
          `).match(
            () => console.log('list_itemsテーブルの初期化が完了しました'),
            (error: Error) =>
              console.error('list_itemsテーブル初期化エラー:', error.message)
          );
        },
        (error: Error) =>
          console.error('refresh_tokensテーブル初期化エラー:', error.message)
      );
    },
    (error: Error) => console.error('usersテーブル初期化エラー:', error.message)
  );
};

// 初期化を実行
initializeDatabase();

// クエリを実行するヘルパー
export function runQuery<T = void>(
  sql: string,
  params: unknown[] = []
): ResultAsync<T, InternalServerError> {
  return ResultAsync.fromPromise(
    new Promise<T>((resolve, reject) => {
      getDatabase().run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          // SQLiteの場合はthisにlastID等が含まれる
          resolve(this as unknown as T);
        }
      });
    }),
    (error) =>
      new InternalServerError(
        error instanceof Error ? error.message : String(error)
      )
  );
}

// データを取得するヘルパー
export function getOne<T>(
  sql: string,
  params: unknown[] = []
): ResultAsync<T | null, InternalServerError> {
  return ResultAsync.fromPromise(
    new Promise<T | null>((resolve, reject) => {
      getDatabase().get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T | null);
        }
      });
    }),
    (error) =>
      new InternalServerError(
        error instanceof Error ? error.message : String(error)
      )
  );
}

// 複数データを取得するヘルパー
export function getMany<T>(
  sql: string,
  params: unknown[] = []
): ResultAsync<T[], InternalServerError> {
  return ResultAsync.fromPromise(
    new Promise<T[]>((resolve, reject) => {
      getDatabase().all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    }),
    (error) =>
      new InternalServerError(
        error instanceof Error ? error.message : String(error)
      )
  );
}

// データベース接続を閉じる関数
export const closeDatabase = (): ResultAsync<void, InternalServerError> => {
  return ResultAsync.fromPromise(
    new Promise<void>((resolve, reject) => {
      getDatabase().close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('データベース接続を閉じました');
          resolve();
        }
      });
    }),
    (error) =>
      new InternalServerError(
        error instanceof Error ? error.message : String(error)
      )
  );
};
