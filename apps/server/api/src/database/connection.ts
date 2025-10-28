import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ResultAsync } from 'neverthrow';
import sqlite3 from 'sqlite3';
import { InternalServerError } from '../utils/errors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/database.sqlite');

// SQLite3をverboseモードで初期化
const sqlite = sqlite3.verbose();

export const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('データベース接続エラー:', err.message);
  } else {
    console.log('SQLiteデータベースに接続しました');
    initializeDatabase();
  }
});

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
        () => console.log('データベースの初期化が完了しました'),
        (error: Error) =>
          console.error('refresh_tokensテーブル初期化エラー:', error.message)
      );
    },
    (error: Error) => console.error('usersテーブル初期化エラー:', error.message)
  );
};

// クエリを実行するヘルパー
export function runQuery<T = void>(
  sql: string,
  params: unknown[] = []
): ResultAsync<T, InternalServerError> {
  return ResultAsync.fromPromise(
    new Promise<T>((resolve, reject) => {
      db.run(sql, params, function (err) {
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
      db.get(sql, params, (err, row) => {
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
      db.all(sql, params, (err, rows) => {
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
      db.close((err) => {
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
