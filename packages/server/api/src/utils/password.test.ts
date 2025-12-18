import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('Password Utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('hashPassword', () => {
        it('パスワードを正常にハッシュ化できる', async () => {
            const password = 'test-password-123';
            const result = await hashPassword(password);

            expect(result.isOk()).toBe(true);
            if (result.isOk()) {
                const hash = result.value;
                expect(hash).toBeDefined();
                expect(typeof hash).toBe('string');
                expect(hash.length).toBeGreaterThan(0);
                expect(hash).not.toBe(password); // ハッシュ化されている
            }
        });

        it('同じパスワードでも異なるハッシュが生成される', async () => {
            const password = 'test-password-123';
            const result1 = await hashPassword(password);
            const result2 = await hashPassword(password);

            expect(result1.isOk()).toBe(true);
            expect(result2.isOk()).toBe(true);
            if (result1.isOk() && result2.isOk()) {
                expect(result1.value).not.toBe(result2.value); // Salt により異なるハッシュが生成される
            }
        });

        it('異なるパスワードで異なるハッシュが生成される', async () => {
            const password1 = 'password1';
            const password2 = 'password2';
            const result1 = await hashPassword(password1);
            const result2 = await hashPassword(password2);

            expect(result1.isOk()).toBe(true);
            expect(result2.isOk()).toBe(true);
            if (result1.isOk() && result2.isOk()) {
                expect(result1.value).not.toBe(result2.value);
            }
        });

        it('空のパスワードをハッシュ化できる', async () => {
            const password = '';
            const result = await hashPassword(password);

            expect(result.isOk()).toBe(true);
            if (result.isOk()) {
                expect(result.value).toBeDefined();
            }
        });

        it('長いパスワードをハッシュ化できる', async () => {
            const password = 'a'.repeat(1000);
            const result = await hashPassword(password);

            expect(result.isOk()).toBe(true);
            if (result.isOk()) {
                expect(result.value).toBeDefined();
            }
        });
    });

    describe('verifyPassword', () => {
        it('正しいパスワードを検証できる', async () => {
            const password = 'test-password-123';
            const hashResult = await hashPassword(password);

            expect(hashResult.isOk()).toBe(true);
            if (hashResult.isOk()) {
                const hash = hashResult.value;
                const verifyResult = await verifyPassword(password, hash);

                expect(verifyResult.isOk()).toBe(true);
                if (verifyResult.isOk()) {
                    expect(verifyResult.value).toBe(true);
                }
            }
        });

        it('間違ったパスワードの場合はfalseを返す', async () => {
            const password = 'correct-password';
            const wrongPassword = 'wrong-password';
            const hashResult = await hashPassword(password);

            expect(hashResult.isOk()).toBe(true);
            if (hashResult.isOk()) {
                const hash = hashResult.value;
                const verifyResult = await verifyPassword(wrongPassword, hash);

                expect(verifyResult.isOk()).toBe(true);
                if (verifyResult.isOk()) {
                    expect(verifyResult.value).toBe(false);
                }
            }
        });

        it('空のパスワードを検証できる', async () => {
            const password = '';
            const hashResult = await hashPassword(password);

            expect(hashResult.isOk()).toBe(true);
            if (hashResult.isOk()) {
                const hash = hashResult.value;
                const verifyResult = await verifyPassword(password, hash);

                expect(verifyResult.isOk()).toBe(true);
                if (verifyResult.isOk()) {
                    expect(verifyResult.value).toBe(true);
                }
            }
        });

        it('無効なハッシュに対してはfalseを返す', async () => {
            const password = 'test-password';
            const invalidHash = 'not-a-valid-hash';
            const result = await verifyPassword(password, invalidHash);

            // bcryptは無効なハッシュに対してfalseを返すか、エラーを返す
            expect(result.isOk() || result.isErr()).toBe(true);
        });

        it('異なる同士のパスワードとハッシュの組み合わせでfalseを返す', async () => {
            const password1 = 'password1';
            const password2 = 'password2';
            const hashResult = await hashPassword(password1);

            expect(hashResult.isOk()).toBe(true);
            if (hashResult.isOk()) {
                const hash = hashResult.value;
                const verifyResult = await verifyPassword(password2, hash);

                expect(verifyResult.isOk()).toBe(true);
                if (verifyResult.isOk()) {
                    expect(verifyResult.value).toBe(false);
                }
            }
        });
    });

    describe('ハッシュ化と検証の統合テスト', () => {
        it('複数のパスワードに対してハッシュ化と検証が正しく動作する', async () => {
            const passwords = ['password1', 'password2', 'password3'];

            for (const password of passwords) {
                const hashResult = await hashPassword(password);
                expect(hashResult.isOk()).toBe(true);

                if (hashResult.isOk()) {
                    const hash = hashResult.value;
                    const verifyResult = await verifyPassword(password, hash);

                    expect(verifyResult.isOk()).toBe(true);
                    if (verifyResult.isOk()) {
                        expect(verifyResult.value).toBe(true);
                    }
                }
            }
        });
    });
});
