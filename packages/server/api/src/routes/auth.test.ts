import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { runQuery } from '../database/connection.js';
import { db } from '../database/db-instance.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { authRoutes } from './auth.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

// テスト用のユーザーデータ
const testUser = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123',
};

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
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    await runQuery('DELETE FROM refresh_tokens').match(
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

describe('Auth Routes', () => {
    beforeAll(async () => {
        // テスト用データベースの初期化
        await initTestDatabase();
    });

    beforeEach(async () => {
        // 各テスト前にデータベースをクリーンアップ
        await cleanTestDatabase();
    });

    afterAll(async () => {
        // データベース接続を閉じる
        await closeTestDatabase();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect(201);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            // ユーザー情報は返さない仕様に変更
            expect(response.body).not.toHaveProperty('user');
        });

        it('should fail to register with duplicate email', async () => {
            // 最初にユーザーを登録
            await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect(201);

            // 同じメールで再度登録を試みる
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect(409);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.message).toBe('Email already exists');
        });

        it('should fail to register with invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    name: 'Test User',
                    password: 'password123',
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.message).toContain('email');
        });

        it('should fail to register with short password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'another@example.com',
                    name: 'Test User',
                    password: 'short',
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.message).toContain('8 characters');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // ログインテスト用にユーザーを事前登録
            await request(app).post('/api/auth/register').send(testUser);
            // JWTのタイムスタンプが異なるように待つ
            await new Promise((resolve) => setTimeout(resolve, 1100));
        });

        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toMatchObject({
                email: testUser.email,
                name: testUser.name,
            });
        });

        it('should fail to login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword',
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.message).toBe('Invalid credentials');
        });

        it('should fail to login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.message).toBe('Invalid credentials');
        });
    });

    describe('GET /api/auth/me', () => {
        let accessToken: string;

        beforeEach(async () => {
            // ユーザーを登録してログイン
            await request(app).post('/api/auth/register').send(testUser);
            await new Promise((resolve) => setTimeout(resolve, 1100));
            const response = await request(app).post('/api/auth/login').send({
                email: testUser.email,
                password: testUser.password,
            });
            accessToken = response.body.accessToken;
        });

        it('should return user info with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                email: testUser.email,
                name: testUser.name,
            });
            expect(response.body).toHaveProperty('id');
            expect(response.body).not.toHaveProperty('password');
        });

        it('should fail without token', async () => {
            const response = await request(app).get('/api/auth/me').expect(401);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.message).toBe('No token provided');
        });

        it('should fail with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/auth/refresh', () => {
        let refreshToken: string;

        beforeEach(async () => {
            // ユーザーを登録してログイン
            await request(app).post('/api/auth/register').send(testUser);
            await new Promise((resolve) => setTimeout(resolve, 1100));
            const response = await request(app).post('/api/auth/login').send({
                email: testUser.email,
                password: testUser.password,
            });
            refreshToken = response.body.refreshToken;
        });

        it('should refresh tokens successfully', async () => {
            // Wait a bit to ensure different timestamps in JWT
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken })
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            // Both tokens should be present (rotation)
            expect(typeof response.body.accessToken).toBe('string');
            expect(typeof response.body.refreshToken).toBe('string');
        });

        it('should fail with invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid-token' })
                .expect(401);

            expect(response.body).toHaveProperty('error');
            // JWT検証失敗のエラーメッセージ
            expect(response.body.error.message).toContain('Token verification');
        });

        it('should fail with expired refresh token', async () => {
            // 期限切れのトークンを手動でDBに挿入
            const expiredDate = new Date(Date.now() - 1000); // 1秒前
            const { generateRefreshToken } = await import('../utils/jwt.js');
            const expiredToken = generateRefreshToken({
                email: testUser.email,
                userId: 1,
            });

            await runQuery(
                'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
                [1, expiredToken, expiredDate.toISOString()]
            );

            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: expiredToken })
                .expect(401);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.message).toBe('Refresh token expired');
        });
    });

    describe('POST /api/auth/logout', () => {
        let accessToken: string;
        let refreshToken: string;

        beforeEach(async () => {
            // ユーザーを登録してログイン
            await request(app).post('/api/auth/register').send(testUser);
            await new Promise((resolve) => setTimeout(resolve, 1100));
            const response = await request(app).post('/api/auth/login').send({
                email: testUser.email,
                password: testUser.password,
            });
            accessToken = response.body.accessToken;
            refreshToken = response.body.refreshToken;
        });

        it('should logout successfully', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ refreshToken })
                .expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Logged out successfully');

            // ログアウト後、同じrefresh tokenは使えないことを確認
            const refreshResponse = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken })
                .expect(401);

            expect(refreshResponse.body).toHaveProperty('error');
        });

        it('should fail to use refresh token after logout', async () => {
            // 先にログアウト
            await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ refreshToken })
                .expect(200);

            // ログアウト後にrefresh tokenを使おうとする
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken })
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken: 'some-token' })
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/auth/changePassword', () => {
        let accessToken: string;

        beforeEach(async () => {
            // ユーザーを登録してログイン
            await request(app).post('/api/auth/register').send(testUser);
            await new Promise((resolve) => setTimeout(resolve, 1100));
            const response = await request(app).post('/api/auth/login').send({
                email: testUser.email,
                password: testUser.password,
            });
            accessToken = response.body.accessToken;
        });

        it('should change password successfully', async () => {
            const newPassword = 'newpassword123';
            const response = await request(app)
                .post('/api/auth/changePassword')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    currentPassword: testUser.password,
                    newPassword,
                })
                .expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Password changed successfully');

            // 新しいパスワードでログインできることを確認
            await new Promise((resolve) => setTimeout(resolve, 1100));
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: newPassword,
                })
                .expect(200);

            expect(loginResponse.body).toHaveProperty('accessToken');
        });

        it('should fail with incorrect current password', async () => {
            const response = await request(app)
                .post('/api/auth/changePassword')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    currentPassword: 'wrongpassword',
                    newPassword: 'newpassword123',
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.message).toBe(
                'Current password is incorrect'
            );
        });

        it('should fail with short new password', async () => {
            const response = await request(app)
                .post('/api/auth/changePassword')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    currentPassword: testUser.password,
                    newPassword: 'short',
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.message).toContain('8 characters');
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/auth/changePassword')
                .send({
                    currentPassword: testUser.password,
                    newPassword: 'newpassword123',
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error.message).toBe('No token provided');
        });

        it('should fail with invalid token', async () => {
            const response = await request(app)
                .post('/api/auth/changePassword')
                .set('Authorization', 'Bearer invalid-token')
                .send({
                    currentPassword: testUser.password,
                    newPassword: 'newpassword123',
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });

        it('should fail without current password', async () => {
            const response = await request(app)
                .post('/api/auth/changePassword')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    newPassword: 'newpassword123',
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should fail without new password', async () => {
            const response = await request(app)
                .post('/api/auth/changePassword')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    currentPassword: testUser.password,
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('old password should not work after password change', async () => {
            const newPassword = 'newpassword123';

            // パスワードを変更
            await request(app)
                .post('/api/auth/changePassword')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    currentPassword: testUser.password,
                    newPassword,
                })
                .expect(200);

            // 古いパスワードでのログインが失敗することを確認
            await new Promise((resolve) => setTimeout(resolve, 1100));
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(401);

            expect(loginResponse.body).toHaveProperty('error');
            expect(loginResponse.body.error.message).toBe(
                'Invalid credentials'
            );
        });
    });
});
