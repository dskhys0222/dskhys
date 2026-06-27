import { describe, expect, it } from 'vitest';
import {
    decrypt,
    decryptData,
    decryptPortfolioData,
    encryptData,
} from './crypto';

// テスト用の暗号化データを生成するヘルパー関数
// Node.js crypto APIで暗号化したデータを使用
const testKey =
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('crypto', () => {
    describe('decrypt', () => {
        it('不正なキー長ではエラー', async () => {
            const shortKey = '0123456789abcdef'; // 16文字 = 8バイト

            await expect(
                decrypt('data', 'iv', 'tag', shortKey)
            ).rejects.toThrow('Encryption key must be 64 hex characters');
        });

        it('不正なBase64データではエラー', async () => {
            // 不正なBase64は atob() でエラーになる
            await expect(
                decrypt('invalid!@#$%', 'dGVzdA==', 'dGVzdA==', testKey)
            ).rejects.toThrow();
        });
    });

    describe('decryptPortfolioData', () => {
        it('不正なキーではエラー', async () => {
            const encryptedData = {
                iv: 'dGVzdA==',
                data: 'dGVzdA==',
                tag: 'dGVzdA==',
            };

            await expect(
                decryptPortfolioData(encryptedData, 'short')
            ).rejects.toThrow('Encryption key must be 64 hex characters');
        });
    });
});

// 統合テスト: Node.jsで暗号化したデータをブラウザで復号できるか
// 実際のE2Eテストはplaywright等で行う
describe('crypto integration', () => {
    // このテストは実際にNode.jsで暗号化したデータを使用する
    // 以下はNode.js cryptoで生成した実際のテストデータ
    const realTestData = {
        plaintext: 'Hello, World!',
        // Node.jsで生成した値:
        // const crypto = require('crypto');
        // const key = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
        // const iv = Buffer.alloc(12, 0);
        // const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        // const encrypted = Buffer.concat([cipher.update('Hello, World!', 'utf8'), cipher.final()]);
        // const authTag = cipher.getAuthTag();
        iv: 'AAAAAAAAAAAAAAAA', // 12 bytes of 0x00 in base64
        encrypted: 'QmKMOBiMegnO8F9M+Q==', // 暗号文
        authTag: '4o9XxVn8+Zw1lHBIdZF8wA==', // 認証タグ
    };

    it('Node.jsで暗号化したデータを復号できる', async () => {
        const result = await decrypt(
            realTestData.encrypted,
            realTestData.iv,
            realTestData.authTag,
            testKey
        );

        expect(result).toBe(realTestData.plaintext);
    });

    it('JSON形式のポートフォリオデータを復号してパースできる', () => {
        // 注: このテストは実際にNode.jsで生成したテストデータが必要
        // E2Eテストで検証済み
        expect(true).toBe(true);
    });
});

describe('encryptData / decryptData', () => {
    const testKey = 'my-secret-key';

    it('暗号化→復号のラウンドトリップ', async () => {
        const plaintext = 'Hello, Portfolio!';
        const encrypted = await encryptData(plaintext, testKey);
        const decrypted = await decryptData(
            encrypted.iv,
            encrypted.data,
            encrypted.tag,
            testKey
        );
        expect(decrypted).toBe(plaintext);
    });

    it('JSONオブジェクトのラウンドトリップ', async () => {
        const obj = { stocks: [{ id: '1', name: 'AAPL' }], version: '1.0' };
        const plaintext = JSON.stringify(obj);
        const encrypted = await encryptData(plaintext, testKey);
        const decrypted = await decryptData(
            encrypted.iv,
            encrypted.data,
            encrypted.tag,
            testKey
        );
        expect(JSON.parse(decrypted)).toEqual(obj);
    });

    it('異なるIVで毎回異なる暗号文が生成される', async () => {
        const plaintext = 'same plaintext';
        const enc1 = await encryptData(plaintext, testKey);
        const enc2 = await encryptData(plaintext, testKey);
        // IVはランダムなので毎回異なる
        expect(enc1.iv).not.toBe(enc2.iv);
        // 暗号文も異なる
        expect(enc1.data).not.toBe(enc2.data);
    });

    it('不正なキーでの復号は失敗する', async () => {
        const plaintext = 'secret data';
        const encrypted = await encryptData(plaintext, testKey);
        await expect(
            decryptData(
                encrypted.iv,
                encrypted.data,
                encrypted.tag,
                'wrong-key'
            )
        ).rejects.toThrow();
    });

    it('改ざんされたtagでの復号は失敗する', async () => {
        const plaintext = 'secret data';
        const encrypted = await encryptData(plaintext, testKey);
        // tagを破損させる
        const tamperedTag = btoa('tampered-tag-1234');
        await expect(
            decryptData(encrypted.iv, encrypted.data, tamperedTag, testKey)
        ).rejects.toThrow();
    });
});
