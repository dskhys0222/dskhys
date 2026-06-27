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

const testUser = {
    email: 'snapshot-test@example.com',
    name: 'Snapshot Test User',
    password: 'password123',
};

let testUserId: number;
let testAccessToken: string;

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
    CREATE TABLE IF NOT EXISTS portfolio_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      iv TEXT NOT NULL,
      encrypted_data TEXT NOT NULL,
      auth_tag TEXT NOT NULL,
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

const cleanTestDatabase = async (): Promise<void> => {
    await runQuery('DELETE FROM portfolio_snapshots').match(
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

const closeTestDatabase = (): Promise<void> =>
    new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });

describe('Portfolio Snapshot Routes', () => {
    beforeAll(async () => {
        await initTestDatabase();
    });

    beforeEach(async () => {
        await cleanTestDatabase();

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

    const validPayload = {
        iv: 'dGVzdC1pdi1iYXNlNjQ=',
        data: 'ZW5jcnlwdGVkLWRhdGE=',
        tag: 'YXV0aC10YWctYmFzZTY0',
    };

    describe('GET /api/portfolio/snapshot', () => {
        it('未認証でのアクセスは401を返す', async () => {
            const response = await request(app).get('/api/portfolio/snapshot');

            expect(response.status).toBe(401);
        });

        it('データなしのGETは404を返す', async () => {
            const response = await request(app)
                .get('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`);

            expect(response.status).toBe(404);
        });

        it('データありのGETは200とデータを返す', async () => {
            await request(app)
                .put('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send(validPayload);

            const response = await request(app)
                .get('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toBe(validPayload.data);
            expect(response.body.iv).toBe(validPayload.iv);
            expect(response.body.tag).toBe(validPayload.tag);
            expect(response.body.updatedAt).toBeDefined();
        });
    });

    describe('PUT /api/portfolio/snapshot', () => {
        it('未認証でのアクセスは401を返す', async () => {
            const response = await request(app)
                .put('/api/portfolio/snapshot')
                .send(validPayload);

            expect(response.status).toBe(401);
        });

        it('初回PUTは201を返す', async () => {
            const response = await request(app)
                .put('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send(validPayload);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });

        it('2回目PUTは200を返す', async () => {
            await request(app)
                .put('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send(validPayload);

            const updatedPayload = {
                ...validPayload,
                data: 'dXBkYXRlZC1kYXRh',
            };
            const response = await request(app)
                .put('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send(updatedPayload);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('clientUpdatedAtなしの場合は楽観的ロックを適用しない', async () => {
            await request(app)
                .put('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send(validPayload);

            const response = await request(app)
                .put('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send({ ...validPayload, data: 'dXBkYXRlZA==' });

            expect(response.status).toBe(200);
        });

        it('clientUpdatedAtが指定され衝突がない場合は正常にupsertされる', async () => {
            const firstRes = await request(app)
                .put('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send(validPayload);
            expect(firstRes.status).toBe(201);

            // 更新後のupdated_atを取得
            const getRes = await request(app)
                .get('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`);
            const updatedAt = getRes.body.updatedAt;

            const response = await request(app)
                .put('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send({
                    ...validPayload,
                    data: 'dXBkYXRlZA==',
                    clientUpdatedAt: updatedAt,
                });

            expect(response.status).toBe(200);
        });

        it('楽観的ロック衝突のPUTは409を返す', async () => {
            await request(app)
                .put('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send(validPayload);

            // サーバー上の updated_at より古い clientUpdatedAt を指定
            const response = await request(app)
                .put('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send({
                    ...validPayload,
                    data: 'dXBkYXRlZA==',
                    clientUpdatedAt: '2000-01-01T00:00:00.000Z',
                });

            expect(response.status).toBe(409);
        });

        it('必須フィールドが欠けている場合は400を返す', async () => {
            const response = await request(app)
                .put('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send({ iv: 'test-iv' });

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /api/portfolio/snapshot', () => {
        it('未認証でのアクセスは401を返す', async () => {
            const response = await request(app).delete(
                '/api/portfolio/snapshot'
            );

            expect(response.status).toBe(401);
        });

        it('認証済みユーザーはスナップショットを削除できる', async () => {
            await request(app)
                .put('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send(validPayload);

            const response = await request(app)
                .delete('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`);

            expect(response.status).toBe(204);

            // 削除後はGETで404
            const getResponse = await request(app)
                .get('/api/portfolio/snapshot')
                .set('Authorization', `Bearer ${testAccessToken}`);
            expect(getResponse.status).toBe(404);
        });
    });
});
