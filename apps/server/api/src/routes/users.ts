import { Router } from 'express';
import {
  asyncHandler,
  NotFoundError,
  ValidationError,
} from '../utils/errors.js';

export const userRoutes = Router();

// GET /api/users/:id - ユーザー取得の例
userRoutes.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    // バリデーション例
    if (!id || Number.isNaN(Number(id))) {
      throw new ValidationError('Invalid user ID');
    }

    // データベース検索の模擬
    const userId = Number(id);
    if (userId > 100) {
      throw new NotFoundError('User');
    }

    // 正常レスポンス
    res.json({
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
    });
  })
);

// POST /api/users - ユーザー作成の例
userRoutes.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
      throw new ValidationError('Name and email are required');
    }

    if (!email.includes('@')) {
      throw new ValidationError('Invalid email format');
    }

    // 作成処理の模擬
    const newUser = {
      id: Math.floor(Math.random() * 1000),
      name,
      email,
      created_at: new Date().toISOString(),
    };

    res.status(201).json(newUser);
  })
);
