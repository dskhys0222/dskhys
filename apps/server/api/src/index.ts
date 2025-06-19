import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import { router } from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
