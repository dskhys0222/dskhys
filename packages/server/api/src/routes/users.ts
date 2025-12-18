import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { err, ok, Result } from 'neverthrow';
import {
    asyncHandler,
    NotFoundError,
    ValidationError,
} from '../utils/errors.js';

export const userRoutes: ExpressRouter = Router();

// GET /api/users/:id - ユーザー取得の例
userRoutes.get(
    '/:id',
    asyncHandler((req, res) => {
        const { id } = req.params;

        // 検証関数を作成
        const validateId = (idParam: string): Result<number, Error> => {
            if (!idParam || Number.isNaN(Number(idParam))) {
                return err(new ValidationError('Invalid user ID'));
            }
            const numId = Number(idParam);

            if (numId > 100) {
                return err(new NotFoundError('User'));
            }

            return ok(numId);
        };

        // IDを検証して処理を続行
        return validateId(id).map((userId) => {
            // 正常レスポンスの生成
            const user = {
                email: `user${userId}@example.com`,
                id: userId,
                name: `User ${userId}`,
            };

            // レスポンスを送信
            res.json(user);
            return user;
        });
    })
);

// POST /api/users - ユーザー作成の例
userRoutes.post(
    '/',
    asyncHandler((req, res) => {
        const { name, email } = req.body;

        // 名前のバリデーション
        const nameResult = name
            ? ok(name)
            : err(new ValidationError('Name is required'));

        // メールのバリデーションを実行する関数
        const validateEmail = (email: string): Result<string, Error> => {
            if (!email) {
                return err(new ValidationError('Email is required'));
            }

            if (!email.includes('@')) {
                return err(new ValidationError('Invalid email format'));
            }

            return ok(email);
        };

        // メールのバリデーション実行
        const emailResult = validateEmail(email);

        // 両方のバリデーション結果を合成
        const combinedResult = Result.combine([nameResult, emailResult]);

        return combinedResult.map(([validName, validEmail]) => {
            // すべてのバリデーションを通過したら、ユーザー作成
            const newUser = {
                created_at: new Date().toISOString(),
                email: validEmail,
                id: Math.floor(Math.random() * 1000),
                name: validName,
            };

            // 成功レスポンスを送信
            res.status(201).json(newUser);
            return newUser;
        });
    })
);
