import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { authRoutes } from './auth.js';
import { itemRoutes } from './item.js';
import { portfolioRoutes } from './portfolio.js';
import { userRoutes } from './users.js';

export const router: ExpressRouter = Router();

// 基本的なルート
router.get('/', (_req, res) => {
    res.json({
        message: 'API is running',
        timestamp: new Date().toISOString(),
        version: '0.0.1',
    });
});

// 認証ルート
router.use('/auth', authRoutes);

// ユーザールート
router.use('/users', userRoutes);

// アイテムルート
router.use('/item', itemRoutes);

// ポートフォリオルート
router.use('/portfolio', portfolioRoutes);

// TODO: 他のルートを追加
// router.use('/posts', postRoutes)
