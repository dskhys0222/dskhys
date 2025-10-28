import { Router } from 'express';
import { err, ok } from 'neverthrow';
import { getOne, runQuery } from '../database/connection.js';
import { authenticate } from '../middleware/authenticate.js';
import { insertRefreshToken } from '../repository/refreshTokensRepository.js';
import { findUserByEmail, insertUser } from '../repository/usersRepository.js';
import type {
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  User,
} from '../schemas/index.js';
import {
  LoginSchema,
  LogoutSchema,
  RefreshTokenSchema,
  RegisterSchema,
} from '../schemas/index.js';
import {
  asyncHandler,
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from '../utils/errors.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { parseSchema } from '../utils/validation.js';

export const authRoutes = Router();

interface DbUser extends User {
  password_hash: string;
}

interface RefreshTokenRow {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

/**
 * POST /api/auth/register - ユーザー登録
 */
authRoutes.post(
  '/register',
  asyncHandler(async (req, res) => {
    return await parseSchema(RegisterSchema, req.body).asyncAndThen((input) =>
      findUserByEmail(input.email)
        .andThen((user) =>
          user == null ? ok() : err(new ConflictError('Email already exists'))
        )
        .andThen(() =>
          hashPassword(input.password).andThen((passwordHash) =>
            insertUser(input.name, input.email, passwordHash)
          )
        )
        .map(({ lastID: userId }) => ({
          userId,
          accessToken: generateAccessToken({ userId, email: input.email }),
          refreshToken: generateRefreshToken({ userId, email: input.email }),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
        }))
        .andThen(({ userId, accessToken, refreshToken, expiresAt }) =>
          insertRefreshToken(userId, refreshToken, expiresAt).map(() => ({
            accessToken,
            refreshToken,
          }))
        )
        .map(({ accessToken, refreshToken }) =>
          res.status(201).json({
            accessToken,
            refreshToken,
          })
        )
    );
  })
);

/**
 * POST /api/auth/login - ログイン
 */
authRoutes.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parseResult = LoginSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.errors[0].message);
    }

    const { email, password }: LoginInput = parseResult.data;

    // ユーザーを検索
    const userResult = await getOne<DbUser>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    return userResult.asyncAndThen(async (user) => {
      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // パスワードを検証
      const passwordValidResult = await verifyPassword(
        password,
        user.password_hash
      );

      return passwordValidResult.asyncAndThen(async (isValid) => {
        if (!isValid) {
          throw new UnauthorizedError('Invalid credentials');
        }

        // トークンを生成
        const accessToken = generateAccessToken({
          userId: user.id as number,
          email: user.email,
        });
        const refreshToken = generateRefreshToken({
          userId: user.id as number,
          email: user.email,
        });

        // リフレッシュトークンをデータベースに保存
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30日後

        await runQuery(
          'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [user.id, refreshToken, expiresAt.toISOString()]
        );

        // パスワードハッシュを含めないユーザー情報
        const userResponse = {
          id: user.id,
          name: user.name,
          email: user.email,
        };

        res.status(200).json({
          accessToken,
          refreshToken,
          user: userResponse,
        });

        return { user: userResponse, accessToken, refreshToken };
      });
    });
  })
);

/**
 * POST /api/auth/logout - ログアウト
 */
authRoutes.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    const parseResult = LogoutSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.errors[0].message);
    }

    const { refreshToken }: LogoutInput = parseResult.data;

    // リフレッシュトークンをデータベースから削除
    const deleteResult = await runQuery(
      'DELETE FROM refresh_tokens WHERE token = ?',
      [refreshToken]
    );

    return deleteResult.map(() => {
      res.status(200).json({
        message: 'Logged out successfully',
      });
      return { success: true };
    });
  })
);

/**
 * POST /api/auth/refresh - トークンリフレッシュ
 */
authRoutes.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const parseResult = RefreshTokenSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.errors[0].message);
    }

    const { refreshToken }: RefreshTokenInput = parseResult.data;

    // リフレッシュトークンを検証
    const verifyResult = verifyRefreshToken(refreshToken);

    if (verifyResult.isErr()) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const decoded = verifyResult.value;

    // データベースでトークンを確認
    const tokenResult = await getOne<RefreshTokenRow>(
      'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ?',
      [refreshToken, decoded.userId]
    );

    return tokenResult.asyncAndThen(async (tokenRow) => {
      if (!tokenRow) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // トークンの有効期限を確認
      const expiresAt = new Date(tokenRow.expires_at);
      if (expiresAt < new Date()) {
        // 期限切れのトークンを削除
        await runQuery('DELETE FROM refresh_tokens WHERE id = ?', [
          tokenRow.id,
        ]);
        throw new UnauthorizedError('Refresh token expired');
      }

      // ユーザー情報を取得
      const userResult = await getOne<DbUser>(
        'SELECT * FROM users WHERE id = ?',
        [decoded.userId]
      );

      return userResult.asyncAndThen(async (user) => {
        if (!user) {
          throw new UnauthorizedError('User not found');
        }

        // 新しいトークンを生成
        const newAccessToken = generateAccessToken({
          userId: user.id as number,
          email: user.email,
        });
        const newRefreshToken = generateRefreshToken({
          userId: user.id as number,
          email: user.email,
        });

        // 古いリフレッシュトークンを削除
        await runQuery('DELETE FROM refresh_tokens WHERE token = ?', [
          refreshToken,
        ]);

        // 新しいリフレッシュトークンを保存
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30日後

        await runQuery(
          'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [user.id, newRefreshToken, expiresAt.toISOString()]
        );

        res.status(200).json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
      });
    });
  })
);

/**
 * GET /api/auth/me - 現在のユーザー情報取得
 */
authRoutes.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const userId = req.user.userId;

    const userResult = await getOne<DbUser>(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    return userResult.map((user) => {
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      });

      return user;
    });
  })
);
