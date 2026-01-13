import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import { loggingMiddleware } from './middleware/logging.js';
import { router } from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

console.log('[API] NODE_ENV:', process.env.NODE_ENV);
console.log('[API] PORT:', PORT);
console.log('[API] ALLOWED_DOMAIN:', process.env.ALLOWED_DOMAIN || 'not set');

// CORS設定：サブドメインからのリクエストを許可
const corsOptions = {
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ) => {
        // オリジンがない場合（同一オリジン、モバイルアプリなど）を許可
        if (!origin) {
            return callback(null, true);
        }

        // localhost と 127.0.0.1 を許可（開発環境用）
        if (
            origin === 'http://localhost:5173' ||
            origin === 'http://127.0.0.1:5173'
        ) {
            return callback(null, true);
        }

        // メインドメイン配下のサブドメインを許可
        const allowedDomain = process.env.ALLOWED_DOMAIN || 'localhost';
        if (
            origin.endsWith(`.${allowedDomain}`) ||
            origin === `http://${allowedDomain}` ||
            origin === `https://${allowedDomain}`
        ) {
            return callback(null, true);
        }

        // ホワイトリストに明示的に設定されたオリジンを許可
        const whitelist = (process.env.CORS_WHITELIST || '')
            .split(',')
            .filter(Boolean);
        if (whitelist.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24時間
};

// ミドルウェア
app.use(loggingMiddleware);
app.use(cors(corsOptions));
app.use(express.json());

// ヘルスチェック（エラーハンドラーの前に配置）
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ルーティング
app.use('/api', router);

// エラーハンドリング
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
