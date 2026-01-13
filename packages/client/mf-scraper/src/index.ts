/**
 * mf-scraper メインエントリポイント
 *
 * 1. 設定ファイルの読み込み
 * 2. APIサーバーへのログイン
 * 3. マネーフォワードからポートフォリオデータをスクレイピング
 * 4. データを暗号化
 * 5. APIサーバーへ送信
 */

import * as fs from 'node:fs';
import { ApiClient } from './api.js';
import { getAuthFilePath, loadConfig } from './config.js';
import { encrypt } from './encrypt.js';
import {
    checkLoginStatus,
    createContextWithSession,
    launchBrowser,
    scrapePortfolio,
} from './scraper.js';

const main = async (): Promise<void> => {
    console.log('=== mf-scraper ===');
    console.log(`実行日時: ${new Date().toISOString()}\n`);

    // 1. 設定ファイルの読み込み
    console.log('設定ファイルを読み込み中...');
    const config = loadConfig();
    console.log(`APIサーバー: ${config.apiUrl}\n`);

    // 2. セッションファイルの確認
    const authFilePath = getAuthFilePath();
    if (!fs.existsSync(authFilePath)) {
        console.error('エラー: セッションファイルが見つかりません。');
        console.error('先に `pnpm login` を実行してログインしてください。');
        process.exit(1);
    }

    // 3. APIサーバーへのログイン
    console.log('APIサーバーにログイン中...');
    const apiClient = new ApiClient({
        baseUrl: config.apiUrl,
        username: config.apiUsername,
        password: config.apiPassword,
    });
    await apiClient.login();
    console.log('APIサーバーへのログイン成功\n');

    // 4. ブラウザ起動とスクレイピング
    console.log('ブラウザを起動中...');
    const browser = await launchBrowser();

    try {
        const context = await createContextWithSession(browser);
        const page = await context.newPage();

        // ログイン状態確認
        console.log('マネーフォワードのログイン状態を確認中...');
        const isLoggedIn = await checkLoginStatus(page);

        if (!isLoggedIn) {
            console.error('エラー: マネーフォワードにログインしていません。');
            console.error('セッションが期限切れの可能性があります。');
            console.error('`pnpm login` で再ログインしてください。');
            process.exit(1);
        }
        console.log('ログイン状態OK\n');

        // スクレイピング実行
        console.log('ポートフォリオデータを取得中...');
        const portfolioData = await scrapePortfolio(page);
        console.log(`取得銘柄数: ${portfolioData.stocks.length}`);
        console.log(`取得日時: ${portfolioData.scrapedAt}\n`);

        // 5. データ暗号化
        console.log('データを暗号化中...');
        const dataJson = JSON.stringify(portfolioData);
        const encryptionKey = Buffer.from(config.encryptionKey, 'hex');
        const encryptedData = encrypt(dataJson, encryptionKey);
        console.log('暗号化完了\n');

        // 6. APIサーバーへ送信
        console.log('APIサーバーへ送信中...');
        await apiClient.sendEncryptedPortfolio(
            encryptedData,
            portfolioData.scrapedAt
        );
        console.log('送信完了！\n');

        console.log('=== 処理完了 ===');
    } finally {
        await browser.close();
    }
};

// エラーハンドリング
main().catch((error) => {
    console.error('致命的なエラー:', error);
    process.exit(1);
});
