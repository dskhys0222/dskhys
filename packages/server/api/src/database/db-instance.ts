import { mkdirSync } from 'node:fs';
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
    : process.env.DATABASE_PATH ||
      path.join(__dirname, '../../data/database.sqlite');

// 本番環境の場合、データベースディレクトリを自動作成
if (!isTest && dbPath !== ':memory:') {
    const dbDir = path.dirname(dbPath);
    try {
        mkdirSync(dbDir, { recursive: true });
        console.log('データベースディレクトリを作成/確認しました:', dbDir);
    } catch (err) {
        console.error('データベースディレクトリ作成エラー:', err);
    }
}

// データベースインスタンス
export const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('データベース接続エラー:', err.message);
        console.error('接続しようとしたパス:', dbPath);
        console.error(
            '使用されている DATABASE_PATH 環境変数:',
            process.env.DATABASE_PATH
        );
    } else {
        if (!isTest) {
            console.log('SQLiteデータベースに接続しました');
            console.log('データベースパス:', dbPath);
        }
    }
});

/**
 * データベースインスタンスを取得
 */
export const getDatabase = (): sqlite3.Database => {
    return db;
};
