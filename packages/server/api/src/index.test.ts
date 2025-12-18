import cors from 'cors';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { errorHandler } from './middleware/errorHandler.js';
import { router } from './routes/index.js';

// index.ts と同じようにアプリをセットアップ
const createApp = () => {
    const app = express();

    // ミドルウェア
    app.use(cors());
    app.use(express.json());

    // ルーティング
    app.use('/api', router);

    // エラーハンドリング
    app.use(errorHandler);

    // ヘルスチェック
    app.get('/health', (_req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    return app;
};

describe('Application Integration', () => {
    const app = createApp();

    it('ヘルスチェックエンドポイントが正常に動作する', async () => {
        const response = await request(app).get('/health').expect(200);

        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('timestamp');
        expect(typeof response.body.timestamp).toBe('string');
    });

    it('APIルートが正しくマウントされている', async () => {
        const response = await request(app).get('/api');

        // ルートエンドポイントは200を返す
        expect(response.status).toBe(200);
    });

    it('存在しないエンドポイントは404を返す', async () => {
        const response = await request(app).get('/nonexistent');

        expect(response.status).toBe(404);
    });

    it('CORSが有効になっている', async () => {
        const response = await request(app)
            .get('/health')
            .set('Origin', 'http://example.com');

        expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
});
