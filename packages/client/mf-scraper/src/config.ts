import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export interface Config {
    encryptionKey: string;
    apiUrl: string;
    apiUsername: string;
    apiPassword: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.config', 'mf-scraper');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const AUTH_FILE = path.join(CONFIG_DIR, 'auth.json');

/**
 * 設定ディレクトリを初期化
 */
export const ensureConfigDir = (): void => {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    }
};

/**
 * 設定ファイルを読み込み
 */
export const loadConfig = (): Config => {
    if (!fs.existsSync(CONFIG_FILE)) {
        throw new Error(
            `設定ファイルが見つかりません: ${CONFIG_FILE}\n` +
                '以下の形式で設定ファイルを作成してください:\n' +
                JSON.stringify(
                    {
                        encryptionKey: 'Base64エンコードされた32バイトのキー',
                        apiUrl: 'https://api.example.com',
                        apiUsername: 'APIサーバーのユーザー名',
                        apiPassword: 'APIサーバーのパスワード',
                    },
                    null,
                    2
                )
        );
    }

    const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(content) as Config;

    // バリデーション
    if (!config.encryptionKey) {
        throw new Error('設定ファイルにencryptionKeyがありません');
    }
    if (!config.apiUrl) {
        throw new Error('設定ファイルにapiUrlがありません');
    }
    if (!config.apiUsername) {
        throw new Error('設定ファイルにapiUsernameがありません');
    }
    if (!config.apiPassword) {
        throw new Error('設定ファイルにapiPasswordがありません');
    }

    return config;
};

/**
 * 認証ファイルのパスを取得
 */
export const getAuthFilePath = (): string => AUTH_FILE;

/**
 * 認証ファイルが存在するか確認
 */
export const hasAuthFile = (): boolean => fs.existsSync(AUTH_FILE);

/**
 * 設定ディレクトリのパスを取得
 */
export const getConfigDir = (): string => CONFIG_DIR;
