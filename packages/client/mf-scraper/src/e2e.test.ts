/**
 * mf-scraper エンドツーエンドテスト
 *
 * 実際のマネーフォワードなしで、モック環境で動作確認
 */

import { describe, expect, it } from 'vitest';
import { decrypt, type EncryptedData, encrypt } from './encrypt.js';

describe('end-to-end encryption flow', () => {
    const testKey =
        '4ffa6b761c44097af8962f53b347651960ff98ea53aa916718ffae00c45a3663';

    const mockPortfolioData = {
        stocks: [
            {
                name: 'Apple Inc.',
                units: 100,
                averageCost: 120.5,
                currentPrice: 175.3,
                value: 17530,
                profitLoss: 5480,
                account: 'NISA',
            },
            {
                name: 'ソフトバンクグループ',
                units: 50,
                averageCost: 2400,
                currentPrice: 2850,
                value: 142500,
                profitLoss: 22500,
                account: '特定',
            },
        ],
        scrapedAt: new Date().toISOString(),
    };

    it('バッチ側: データを暗号化', () => {
        const json = JSON.stringify(mockPortfolioData);
        const keyBuffer = Buffer.from(testKey, 'hex');

        const { iv, encrypted, authTag } = encrypt(json, keyBuffer);

        // 各要素が正しく生成されたか確認
        expect(iv).toBeInstanceOf(Buffer);
        expect(iv.length).toBe(12); // 12 bytes IV
        expect(encrypted).toBeInstanceOf(Buffer);
        expect(encrypted.length).toBeGreaterThan(0);
        expect(authTag).toBeInstanceOf(Buffer);
        expect(authTag.length).toBe(16); // 16 bytes auth tag

        console.log('✅ 暗号化成功');
        console.log(`   IV: ${iv.toString('base64')}`);
        console.log(`   暗号文長: ${encrypted.length} bytes`);
        console.log(`   認証タグ: ${authTag.toString('base64')}`);
    });

    it('バッチ側: APIに送信するデータを生成', () => {
        const json = JSON.stringify(mockPortfolioData);
        const keyBuffer = Buffer.from(testKey, 'hex');
        const { iv, encrypted, authTag } = encrypt(json, keyBuffer);

        // API送信形式に変換
        const apiPayload = {
            iv: iv.toString('base64'),
            encryptedData: encrypted.toString('base64'),
            authTag: authTag.toString('base64'),
            scrapedAt: mockPortfolioData.scrapedAt,
        };

        // JSONで送信可能か確認
        const json_serialized = JSON.stringify(apiPayload);
        expect(() => JSON.parse(json_serialized)).not.toThrow();

        console.log('✅ API送信形式を生成');
        console.log(`   ペイロードサイズ: ${json_serialized.length} bytes`);
    });

    it('クライアント側: APIから受け取ったデータを復号', () => {
        const json = JSON.stringify(mockPortfolioData);
        const keyBuffer = Buffer.from(testKey, 'hex');

        // バッチ側で暗号化
        const encryptedData = encrypt(json, keyBuffer);

        // クライアント側で復号（Web Crypto API）
        // 注: Node.js環境なのでWeb Crypto APIではなく、同等の処理をテスト
        const decrypted = decrypt(encryptedData, keyBuffer);
        expect(decrypted).toBe(json);

        const parsed = JSON.parse(decrypted);
        expect(parsed).toEqual(mockPortfolioData);

        console.log('✅ クライアント側の復号成功');
        console.log(`   復号後の銘柄数: ${parsed.stocks.length}`);
        console.log(`   復号後の日時: ${parsed.scrapedAt}`);
    });

    it('データ改ざん検出テスト', () => {
        const json = JSON.stringify(mockPortfolioData);
        const keyBuffer = Buffer.from(testKey, 'hex');
        const encryptedData = encrypt(json, keyBuffer);

        // 認証タグを改ざん
        const tamperedAuthTag = Buffer.alloc(encryptedData.authTag.length);
        encryptedData.authTag.copy(tamperedAuthTag);
        tamperedAuthTag[0] ^= 0xff; // 最初のバイトをフリップ

        // 改ざんされたデータで復号しようとする
        const tamperedData: EncryptedData = {
            ...encryptedData,
            authTag: tamperedAuthTag,
        };

        expect(() => {
            decrypt(tamperedData, keyBuffer);
        }).toThrow();

        console.log('✅ 改ざんが正しく検出されました');
    });

    it('システム全体のフロー: バッチ → API → クライアント', () => {
        // 1. バッチ側：データ暗号化
        const json = JSON.stringify(mockPortfolioData);
        const keyBuffer = Buffer.from(testKey, 'hex');
        const encryptedData = encrypt(json, keyBuffer);

        // 2. API経由での送受信をシミュレート（検証のため変数使用）
        const apiData = {
            iv: encryptedData.iv.toString('base64'),
            encryptedData: encryptedData.encrypted.toString('base64'),
            authTag: encryptedData.authTag.toString('base64'),
            scrapedAt: mockPortfolioData.scrapedAt,
        };

        // 3. クライアント側：データ受け取り
        // API形式(Base64)をBuffer形式に戻す
        const bufferData = {
            iv: Buffer.from(apiData.iv, 'base64'),
            encrypted: Buffer.from(apiData.encryptedData, 'base64'),
            authTag: Buffer.from(apiData.authTag, 'base64'),
        };
        const decrypted = decrypt(bufferData, keyBuffer);

        const result = JSON.parse(decrypted);

        // 4. 検証
        expect(result.stocks.length).toBe(2);
        expect(result.stocks[0].name).toBe('Apple Inc.');
        expect(result.stocks[0].value).toBe(17530);
        expect(result.stocks[1].name).toBe('ソフトバンクグループ');
        expect(result.stocks[1].profitLoss).toBe(22500);
        expect(result.scrapedAt).toBe(mockPortfolioData.scrapedAt);

        console.log('✅ エンドツーエンドフロー完成');
        console.log(
            `   暗号化: ${json.length} bytes → ${encryptedData.encrypted.length} bytes`
        );
        console.log(
            `   圧縮率: ${((encryptedData.encrypted.length / json.length) * 100).toFixed(1)}%`
        );
    });
});
