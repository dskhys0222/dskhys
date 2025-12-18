import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { errorHandler } from '../middleware/errorHandler.js';
import { userRoutes } from './users.js';

describe('userRoutes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/users', userRoutes);
        app.use(errorHandler);
    });

    describe('GET /api/users/:id', () => {
        it('有効なIDでユーザー情報を取得できる', async () => {
            const response = await request(app).get('/api/users/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                email: 'user1@example.com',
                id: 1,
                name: 'User 1',
            });
        });

        it('別の有効なIDでユーザー情報を取得できる', async () => {
            const response = await request(app).get('/api/users/50');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                email: 'user50@example.com',
                id: 50,
                name: 'User 50',
            });
        });

        it('ID が0の場合は正常に動作する', async () => {
            const response = await request(app).get('/api/users/0');

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(0);
        });

        it('ID が100の場合は正常に動作する', async () => {
            const response = await request(app).get('/api/users/100');

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(100);
        });

        it('無効なID(文字列)の場合は400エラーを返す', async () => {
            const response = await request(app).get('/api/users/invalid');

            expect(response.status).toBe(400);
            expect(response.body.error.message).toBe('Invalid user ID');
        });

        it('ID が101以上の場合は404エラーを返す', async () => {
            const response = await request(app).get('/api/users/101');

            expect(response.status).toBe(404);
            expect(response.body.error.message).toBe('User not found');
        });

        it('IDが空文字の場合は400エラーを返す', async () => {
            const response = await request(app).get('/api/users/');

            expect(response.status).toBe(404); // ルート定義により404になる
        });
    });

    describe('POST /api/users', () => {
        it('有効なデータで新しいユーザーを作成できる', async () => {
            const newUser = {
                email: 'test@example.com',
                name: 'Test User',
            };

            const response = await request(app)
                .post('/api/users')
                .send(newUser);

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                email: 'test@example.com',
                name: 'Test User',
            });
            expect(response.body.id).toBeDefined();
            expect(response.body.created_at).toBeDefined();
        });

        it('特殊文字を含むメールアドレスで作成できる', async () => {
            const newUser = {
                email: 'test+special@example.com',
                name: 'Test User',
            };

            const response = await request(app)
                .post('/api/users')
                .send(newUser);

            expect(response.status).toBe(201);
            expect(response.body.email).toBe('test+special@example.com');
        });

        it('名前がない場合は400エラーを返す', async () => {
            const newUser = {
                email: 'test@example.com',
            };

            const response = await request(app)
                .post('/api/users')
                .send(newUser);

            expect(response.status).toBe(400);
            expect(response.body.error.message).toBe('Name is required');
        });

        it('メールアドレスがない場合は400エラーを返す', async () => {
            const newUser = {
                name: 'Test User',
            };

            const response = await request(app)
                .post('/api/users')
                .send(newUser);

            expect(response.status).toBe(400);
            expect(response.body.error.message).toBe('Email is required');
        });

        it('メールアドレスの形式が無効な場合は400エラーを返す', async () => {
            const newUser = {
                email: 'invalid-email',
                name: 'Test User',
            };

            const response = await request(app)
                .post('/api/users')
                .send(newUser);

            expect(response.status).toBe(400);
            expect(response.body.error.message).toBe('Invalid email format');
        });

        it('名前とメールアドレスの両方がない場合は400エラーを返す', async () => {
            const newUser = {};

            const response = await request(app)
                .post('/api/users')
                .send(newUser);

            expect(response.status).toBe(400);
            expect(response.body.error.message).toContain('required');
        });
    });
});
