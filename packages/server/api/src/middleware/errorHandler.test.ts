import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { errorHandler } from '../middleware/errorHandler.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const app = express();
app.use(express.json());

// テスト用のルートを追加
app.get('/test-validation-error', (_req, _res, next) => {
    next(new ValidationError('Test validation error'));
});

app.get('/test-not-found-error', (_req, _res, next) => {
    next(new NotFoundError('TestResource'));
});

app.get('/test-generic-error', (_req, _res, next) => {
    next(new Error('Generic error'));
});

app.get('/test-no-message-error', (_req, _res, next) => {
    const error = new Error();
    error.message = '';
    next(error);
});

// エラーハンドラーを追加
app.use(errorHandler);

describe('Error Handler', () => {
    it('should handle ValidationError with 400 status', async () => {
        const response = await request(app)
            .get('/test-validation-error')
            .expect(400);

        expect(response.body).toMatchObject({
            error: {
                message: 'Test validation error',
            },
        });
    });

    it('should handle NotFoundError with 404 status', async () => {
        const response = await request(app)
            .get('/test-not-found-error')
            .expect(404);

        expect(response.body).toMatchObject({
            error: {
                message: 'TestResource not found',
            },
        });
    });

    it('should handle generic errors with 500 status', async () => {
        const response = await request(app)
            .get('/test-generic-error')
            .expect(500);

        expect(response.body).toMatchObject({
            error: {
                message: 'Generic error',
            },
        });
    });

    it('should include stack trace in development mode', async () => {
        // 環境変数を一時的に設定
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const response = await request(app)
            .get('/test-generic-error')
            .expect(500);

        expect(response.body.error.stack).toBeDefined();

        // 環境変数を元に戻す
        process.env.NODE_ENV = originalEnv;
    });

    it('should use default message when error message is empty', async () => {
        const response = await request(app)
            .get('/test-no-message-error')
            .expect(500);

        expect(response.body).toMatchObject({
            error: {
                message: 'Internal Server Error',
            },
        });
    });
});
