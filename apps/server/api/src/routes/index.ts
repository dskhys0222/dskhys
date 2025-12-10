import { Router } from 'express';
import { authRoutes } from './auth.js';
import { itemRoutes } from './item.js';
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

// 認証ルート
router.use('/auth', authRoutes);

// ユーザールート
router.use('/users', userRoutes);

// アイテムルート
router.use('/item', itemRoutes);

// TODO: 他のルートを追加
// router.use('/posts', postRoutes)
