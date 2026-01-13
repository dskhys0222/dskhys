import { type EncryptedData, encryptedToBase64 } from './encrypt.js';

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

interface ApiClientOptions {
    baseUrl: string;
    username: string;
    password: string;
}

/**
 * APIクライアント
 */
export class ApiClient {
    private baseUrl: string;
    private username: string;
    private password: string;
    private accessToken: string | null = null;

    constructor(options: ApiClientOptions) {
        this.baseUrl = options.baseUrl.replace(/\/$/, ''); // 末尾のスラッシュを削除
        this.username = options.username;
        this.password = options.password;
    }

    /**
     * APIサーバーにログイン
     */
    async login(): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: this.username,
                password: this.password,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`ログイン失敗: ${response.status} ${text}`);
        }

        const data = (await response.json()) as LoginResponse;
        this.accessToken = data.accessToken;
    }

    /**
     * 暗号化ポートフォリオデータを送信
     */
    async sendEncryptedPortfolio(
        encryptedData: EncryptedData,
        scrapedAt: string
    ): Promise<void> {
        if (!this.accessToken) {
            throw new Error('ログインが必要です');
        }

        const base64Data = encryptedToBase64(encryptedData);
        console.log(base64Data);

        const response = await fetch(
            `${this.baseUrl}/api/portfolio/encrypted`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.accessToken}`,
                },
                body: JSON.stringify({
                    iv: base64Data.iv,
                    data: base64Data.encryptedData,
                    tag: base64Data.authTag,
                    scrapedAt,
                }),
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`データ送信失敗: ${response.status} ${text}`);
        }
    }
}
