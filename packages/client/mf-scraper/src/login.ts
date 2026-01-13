/**
 * 初回ログインスクリプト
 *
 * ブラウザを表示モードで起動し、ユーザーが手動でマネーフォワードにログイン。
 * ログイン完了後、セッション情報を保存します。
 */

import * as fs from 'node:fs';
import { chromium } from 'playwright';
import { ensureConfigDir, getAuthFilePath } from './config.js';

const MF_LOGIN_URL = 'https://moneyforward.com/users/sign_in';

/**
 * ログイン処理を実行
 */
export const login = async (): Promise<void> => {
    console.log('=== マネーフォワード ログインスクリプト ===\n');

    // 設定ディレクトリを作成
    ensureConfigDir();

    console.log('ブラウザを起動します...');
    console.log('マネーフォワードのログインページが開きます。\n');

    const browser = await chromium.launch({
        headless: false, // 表示モード
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // ログインページへ
        await page.goto(MF_LOGIN_URL);

        console.log('-------------------------------------------');
        console.log('ブラウザでマネーフォワードにログインしてください。');
        console.log('1. メールアドレスとパスワードを入力');
        console.log('2. 2FAコードを入力');
        console.log('3. ログイン完了後、このコンソールに戻ってください');
        console.log('-------------------------------------------\n');

        // ログイン完了を待機（ホームページまたはポートフォリオページにリダイレクト）
        await page.waitForURL(
            (url) =>
                url.href.includes('moneyforward.com') &&
                !url.href.includes('sign_in') &&
                !url.href.includes('login') &&
                !url.href.includes('two_factor_auth') &&
                !url.href.includes('webauthn'),
            { timeout: 300000 } // 5分タイムアウト
        );

        console.log('ログインを検知しました！\n');

        // セッション情報を保存
        const authFilePath = getAuthFilePath();
        await context.storageState({ path: authFilePath });

        // パーミッションを600に設定（Linuxのみ）
        try {
            fs.chmodSync(authFilePath, 0o600);
        } catch {
            // Windowsでは無視
        }

        console.log(`セッション情報を保存しました: ${authFilePath}`);
        console.log('\nこれで自動スクレイピングが可能になりました。');
        console.log('`mf-scraper` でスクレイピングを実行できます。\n');
    } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
            console.error(
                'タイムアウト: 5分以内にログインを完了してください。'
            );
        } else {
            console.error('エラーが発生しました:', error);
        }
        process.exit(1);
    } finally {
        await browser.close();
    }
};

// 直接実行された場合（開発時）
if (import.meta.url === `file://${process.argv[1]}`) {
    login().catch(console.error);
}
