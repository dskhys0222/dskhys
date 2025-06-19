import { Router } from 'express';
import { userRoutes } from './users.js';

export const router = Router();

// 基本的なルート
router.get('/', (_req, res) => {
  res.json({
    message: 'API is running',
    version: '0.0.1',
    timestamp: new Date().toISOString(),
  });
});

// ユーザールート
router.use('/users', userRoutes);

// TODO: 他のルートを追加
// router.use('/posts', postRoutes)
