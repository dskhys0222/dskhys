import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { runQuery } from '../database/connection.js';
import { db } from '../database/db-instance.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { insertUser } from '../repository/usersRepository.js';
import { generateAccessToken } from '../utils/jwt.js';
import { hashPassword } from '../utils/password.js';
import { portfolioRoutes } from './portfolio.js';

const app = express();
app.use(express.json());
app.use('/api/portfolio', portfolioRoutes);
app.use(errorHandler);

// テスト用のユーザーデータ
const testUser = {
    email: 'portfolio-test@example.com',
    name: 'Portfolio Test User',
    password: 'password123',
};

let testUserId: number;
let testAccessToken: string;

/**
 * テスト用データベースの初期化
 */
const initTestDatabase = async (): Promise<void> => {
    await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).match(
        () => {},
        (error) => {
            throw error;
        }
    );

    await runQuery(`
    CREATE TABLE IF NOT EXISTS encrypted_portfolios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      iv TEXT NOT NULL,
      encrypted_data TEXT NOT NULL,
      auth_tag TEXT NOT NULL,
      scraped_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `).match(
        () => {},
        (error) => {
            throw error;
        }
    );
};

/**
 * テスト用データベースのクリーンアップ
 */
const cleanTestDatabase = async (): Promise<void> => {
    await runQuery('DELETE FROM encrypted_portfolios').match(
        () => {},
        (error) => {
            throw error;
        }
    );
    await runQuery('DELETE FROM users').match(
        () => {},
        (error) => {
            throw error;
        }
    );
};

/**
 * テスト用データベース接続を閉じる
 */
const closeTestDatabase = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};

describe('Portfolio Routes', () => {
    beforeAll(async () => {
        // テスト用データベースの初期化
        await initTestDatabase();
    });

    beforeEach(async () => {
        // 各テスト前にデータベースをクリーンアップ
        await cleanTestDatabase();

        // テストユーザーを作成
        const passwordHashResult = await hashPassword(testUser.password);
        if (passwordHashResult.isErr()) {
            throw passwordHashResult.error;
        }
        const result = await insertUser(
            testUser.name,
            testUser.email,
            passwordHashResult.value
        );
        result.match(
            (res) => {
                testUserId = res.lastID;
                testAccessToken = generateAccessToken({
                    userId: testUserId,
                    email: testUser.email,
                });
            },
            (error) => {
                throw error;
            }
        );
    });

    afterAll(async () => {
        await closeTestDatabase();
    });

    describe('POST /api/portfolio/encrypted', () => {
        const validPayload = {
            iv: 'dGVzdC1pdi1iYXNlNjQ=', // test-iv-base64
            data: 'ZW5jcnlwdGVkLWRhdGE=', // encrypted-data
            tag: 'YXV0aC10YWctYmFzZTY0', // auth-tag-base64
            scrapedAt: '2026-01-13T07:00:00.000Z',
        };

        it('認証済みユーザーが暗号化データを登録できる', async () => {
            const response = await request(app)
                .post('/api/portfolio/encrypted')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send(validPayload);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe(
                'Portfolio data saved successfully'
            );
        });

        it('同じユーザーが再度登録すると上書きされる', async () => {
            // 1回目の登録
            await request(app)
                .post('/api/portfolio/encrypted')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send(validPayload);

            // 2回目の登録（上書き）
            const updatedPayload = {
                ...validPayload,
                data: 'dXBkYXRlZC1kYXRh', // updated-data
                scrapedAt: '2026-01-14T07:00:00.000Z',
            };

            const response = await request(app)
                .post('/api/portfolio/encrypted')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send(updatedPayload);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);

            // 取得して確認
            const getResponse = await request(app)
                .get('/api/portfolio/encrypted')
                .set('Authorization', `Bearer ${testAccessToken}`);

            expect(getResponse.body.data).toBe(updatedPayload.data);
            expect(getResponse.body.scrapedAt).toBe(updatedPayload.scrapedAt);
        });

        it('認証なしでは401エラーを返す', async () => {
            const response = await request(app)
                .post('/api/portfolio/encrypted')
                .send(validPayload);

            expect(response.status).toBe(401);
        });

        it('ivが空の場合は400エラーを返す', async () => {
            const response = await request(app)
                .post('/api/portfolio/encrypted')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send({ ...validPayload, iv: '' });

            expect(response.status).toBe(400);
        });

        it('dataが空の場合は400エラーを返す', async () => {
            const response = await request(app)
                .post('/api/portfolio/encrypted')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send({ ...validPayload, data: '' });

            expect(response.status).toBe(400);
        });

        it('tagが空の場合は400エラーを返す', async () => {
            const response = await request(app)
                .post('/api/portfolio/encrypted')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send({ ...validPayload, tag: '' });

            expect(response.status).toBe(400);
        });

        it('scrapedAtが不正な日時形式の場合は400エラーを返す', async () => {
            const response = await request(app)
                .post('/api/portfolio/encrypted')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send({ ...validPayload, scrapedAt: 'invalid-date' });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/portfolio/encrypted', () => {
        const validPayload = {
            iv: 'dGVzdC1pdi1iYXNlNjQ=',
            data: 'ZW5jcnlwdGVkLWRhdGE=',
            tag: 'YXV0aC10YWctYmFzZTY0',
            scrapedAt: '2026-01-13T07:00:00.000Z',
        };

        it('登録済みデータを取得できる', async () => {
            // 事前にデータを登録
            await request(app)
                .post('/api/portfolio/encrypted')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send(validPayload);

            const response = await request(app)
                .get('/api/portfolio/encrypted')
                .set('Authorization', `Bearer ${testAccessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.iv).toBe(validPayload.iv);
            expect(response.body.data).toBe(validPayload.data);
            expect(response.body.tag).toBe(validPayload.tag);
            expect(response.body.scrapedAt).toBe(validPayload.scrapedAt);
            expect(response.body.updatedAt).toBeDefined();
        });

        it('データが存在しない場合は404エラーを返す', async () => {
            const response = await request(app)
                .get('/api/portfolio/encrypted')
                .set('Authorization', `Bearer ${testAccessToken}`);

            expect(response.status).toBe(404);
            expect(response.body.error.message).toBe(
                'Portfolio data not found'
            );
        });

        it('認証なしでは401エラーを返す', async () => {
            const response = await request(app).get('/api/portfolio/encrypted');

            expect(response.status).toBe(401);
        });

        it('他のユーザーのデータは取得できない', async () => {
            // 最初のユーザーでデータを登録
            await request(app)
                .post('/api/portfolio/encrypted')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send(validPayload);

            // 別のユーザーを作成
            const otherUser = {
                email: 'other@example.com',
                name: 'Other User',
                password: 'password456',
            };
            const otherPasswordHashResult = await hashPassword(
                otherUser.password
            );
            if (otherPasswordHashResult.isErr()) {
                throw otherPasswordHashResult.error;
            }
            let otherUserId: number | undefined;
            let otherAccessToken: string | undefined;

            const result = await insertUser(
                otherUser.name,
                otherUser.email,
                otherPasswordHashResult.value
            );
            result.match(
                (res) => {
                    otherUserId = res.lastID;
                    otherAccessToken = generateAccessToken({
                        userId: otherUserId,
                        email: otherUser.email,
                    });
                },
                (error) => {
                    throw error;
                }
            );

            if (!otherAccessToken) {
                throw new Error('Failed to create other user');
            }

            // 別のユーザーで取得を試みる
            const response = await request(app)
                .get('/api/portfolio/encrypted')
                .set('Authorization', `Bearer ${otherAccessToken}`);

            expect(response.status).toBe(404);
        });
    });
});
