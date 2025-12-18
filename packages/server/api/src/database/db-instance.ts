import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQLite3をverboseモードで初期化
const sqlite = sqlite3.verbose();

// テスト環境ではインメモリDB、本番環境ではファイルDB
const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
const dbPath = isTest
    ? ':memory:'
    : path.join(__dirname, '../../data/database.sqlite');

// データベースインスタンス
export const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('データベース接続エラー:', err.message);
    } else {
        if (!isTest) {
            console.log('SQLiteデータベースに接続しました');
        }
    }
});

/**
 * データベースインスタンスを取得
 */
export const getDatabase = (): sqlite3.Database => {
    return db;
};
