import { describe, expect, it } from 'vitest';
import {
    decrypt,
    type EncryptedData,
    encrypt,
    encryptedToBase64,
} from './encrypt.js';

describe('encrypt', () => {
    // 32バイトのテスト用キー
    const testKey = Buffer.from('0123456789abcdef0123456789abcdef');

    describe('encrypt', () => {
        it('文字列を暗号化できる', () => {
            const plaintext = 'Hello, World!';
            const result = encrypt(plaintext, testKey);

            expect(result.iv).toBeInstanceOf(Buffer);
            expect(result.encrypted).toBeInstanceOf(Buffer);
            expect(result.authTag).toBeInstanceOf(Buffer);
            expect(result.iv.length).toBe(12);
            expect(result.authTag.length).toBe(16);
        });

        it('同じ平文でも毎回異なるIVが生成される', () => {
            const plaintext = 'Same text';
            const result1 = encrypt(plaintext, testKey);
            const result2 = encrypt(plaintext, testKey);

            expect(result1.iv.toString('hex')).not.toBe(
                result2.iv.toString('hex')
            );
            expect(result1.encrypted.toString('hex')).not.toBe(
                result2.encrypted.toString('hex')
            );
        });

        it('キーが32バイトでない場合はエラー', () => {
            const invalidKey = Buffer.from('short');
            expect(() => encrypt('test', invalidKey)).toThrow(
                '暗号化キーは32バイトである必要があります'
            );
        });

        it('JSON文字列を暗号化できる', () => {
            const data = {
                stocks: [
                    { name: 'テスト株', value: 10000 },
                    { name: 'サンプル', value: 20000 },
                ],
                scrapedAt: '2026-01-13T07:00:00.000Z',
            };
            const plaintext = JSON.stringify(data);
            const result = encrypt(plaintext, testKey);

            expect(result.iv).toBeInstanceOf(Buffer);
            expect(result.encrypted).toBeInstanceOf(Buffer);
            expect(result.authTag).toBeInstanceOf(Buffer);
        });
    });

    describe('decrypt', () => {
        it('暗号化したデータを復号できる', () => {
            const plaintext = 'Hello, World!';
            const encrypted = encrypt(plaintext, testKey);
            const decrypted = decrypt(encrypted, testKey);

            expect(decrypted).toBe(plaintext);
        });

        it('JSON文字列を復号してパースできる', () => {
            const data = {
                stocks: [
                    { name: 'テスト株', value: 10000 },
                    { name: 'サンプル', value: 20000 },
                ],
                scrapedAt: '2026-01-13T07:00:00.000Z',
            };
            const plaintext = JSON.stringify(data);
            const encrypted = encrypt(plaintext, testKey);
            const decrypted = decrypt(encrypted, testKey);
            const parsed = JSON.parse(decrypted);

            expect(parsed).toEqual(data);
        });

        it('不正なキーでは復号できない', () => {
            const plaintext = 'Secret data';
            const encrypted = encrypt(plaintext, testKey);

            const wrongKey = Buffer.from('abcdef0123456789abcdef0123456789');

            expect(() => decrypt(encrypted, wrongKey)).toThrow();
        });

        it('改ざんされたデータは復号できない', () => {
            const plaintext = 'Original data';
            const encrypted = encrypt(plaintext, testKey);

            // 認証タグを改ざん
            const tampered: EncryptedData = {
                ...encrypted,
                authTag: Buffer.alloc(16, 0),
            };

            expect(() => decrypt(tampered, testKey)).toThrow();
        });

        it('キーが32バイトでない場合はエラー', () => {
            const invalidKey = Buffer.from('short');
            const encrypted = encrypt('test', testKey);

            expect(() => decrypt(encrypted, invalidKey)).toThrow(
                '暗号化キーは32バイトである必要があります'
            );
        });
    });

    describe('encryptedToBase64', () => {
        it('暗号化データをBase64に変換できる', () => {
            const plaintext = 'Test data';
            const encrypted = encrypt(plaintext, testKey);
            const base64 = encryptedToBase64(encrypted);

            expect(typeof base64.iv).toBe('string');
            expect(typeof base64.encryptedData).toBe('string');
            expect(typeof base64.authTag).toBe('string');

            // Base64であることを確認
            expect(Buffer.from(base64.iv, 'base64')).toEqual(encrypted.iv);
            expect(Buffer.from(base64.encryptedData, 'base64')).toEqual(
                encrypted.encrypted
            );
            expect(Buffer.from(base64.authTag, 'base64')).toEqual(
                encrypted.authTag
            );
        });
    });
});
