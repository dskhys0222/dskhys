import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { err, ok } from 'neverthrow';
import { authenticate } from '../middleware/authenticate.js';
import {
    deleteRefreshToken,
    deleteRefreshTokenById,
    findRefreshToken,
    insertRefreshToken,
} from '../repository/refreshTokensRepository.js';
import {
    findUserByEmail,
    findUserById,
    insertUser,
} from '../repository/usersRepository.js';
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
} from '../utils/errors.js';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { parseSchema } from '../utils/validation.js';

export const authRoutes: ExpressRouter = Router();

/**
 * POST /api/auth/register - ユーザー登録
 */
authRoutes.post(
    '/register',
    asyncHandler((req, res) => {
        return parseSchema(RegisterSchema, req.body).asyncAndThen((input) =>
            findUserByEmail(input.email)
                .andThen((user) =>
                    user == null
                        ? ok()
                        : err(new ConflictError('Email already exists'))
                )
                .andThen(() =>
                    hashPassword(input.password).andThen((passwordHash) =>
                        insertUser(input.name, input.email, passwordHash)
                    )
                )
                .map(({ lastID: userId }) => ({
                    accessToken: generateAccessToken({
                        email: input.email,
                        userId,
                    }),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
                    refreshToken: generateRefreshToken({
                        email: input.email,
                        userId,
                    }),
                    userId,
                }))
                .andThen(({ userId, accessToken, refreshToken, expiresAt }) =>
                    insertRefreshToken(userId, refreshToken, expiresAt).map(
                        () => ({
                            accessToken,
                            refreshToken,
                        })
                    )
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
    asyncHandler((req, res) => {
        return parseSchema(LoginSchema, req.body).asyncAndThen((input) =>
            findUserByEmail(input.email)
                .andThen((user) =>
                    user == null
                        ? err(new UnauthorizedError('Invalid credentials'))
                        : ok(user)
                )
                .andThen((user) =>
                    verifyPassword(input.password, user.password_hash).andThen(
                        (isValid) =>
                            isValid
                                ? ok(user)
                                : err(
                                      new UnauthorizedError(
                                          'Invalid credentials'
                                      )
                                  )
                    )
                )
                .map((user) => ({
                    email: user.email,
                    user: {
                        email: user.email,
                        id: user.id as number, // TODO: 型安全にする
                        name: user.name,
                    },
                    userId: user.id as number, // TODO: 型安全にする
                }))
                .map(({ user, userId, email }) => ({
                    accessToken: generateAccessToken({ email, userId }),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
                    refreshToken: generateRefreshToken({ email, userId }),
                    user,
                }))
                .andThen(({ user, accessToken, refreshToken, expiresAt }) =>
                    insertRefreshToken(user.id, refreshToken, expiresAt).map(
                        () => ({
                            accessToken,
                            refreshToken,
                            user,
                        })
                    )
                )
                .map(({ user, accessToken, refreshToken }) =>
                    res.status(200).json({
                        accessToken,
                        refreshToken,
                        user,
                    })
                )
        );
    })
);

/**
 * POST /api/auth/logout - ログアウト
 */
authRoutes.post(
    '/logout',
    authenticate,
    asyncHandler((req, res) => {
        return parseSchema(LogoutSchema, req.body).asyncAndThen((input) =>
            deleteRefreshToken(input.refreshToken).map(() =>
                res.status(200).json({
                    message: 'Logged out successfully',
                })
            )
        );
    })
);

/**
 * POST /api/auth/refresh - トークンリフレッシュ
 */
authRoutes.post(
    '/refresh',
    asyncHandler((req, res) => {
        return parseSchema(RefreshTokenSchema, req.body)
            .andThen((input) =>
                verifyRefreshToken(input.refreshToken).map((decoded) => ({
                    decoded,
                    input,
                }))
            )
            .asyncAndThen(({ input, decoded }) =>
                findRefreshToken(input.refreshToken, decoded.userId)
                    .andThen((tokenRow) =>
                        tokenRow == null
                            ? err(
                                  new UnauthorizedError('Invalid refresh token')
                              )
                            : ok({ decoded, input, tokenRow })
                    )
                    .andThen(({ tokenRow, decoded, input }) => {
                        const expiresAt = new Date(tokenRow.expires_at);
                        if (expiresAt < new Date()) {
                            return deleteRefreshTokenById(tokenRow.id).andThen(
                                () =>
                                    err(
                                        new UnauthorizedError(
                                            'Refresh token expired'
                                        )
                                    )
                            );
                        }
                        return ok({ decoded, input });
                    })
                    .andThen(({ decoded, input }) =>
                        findUserById(decoded.userId).andThen((user) =>
                            user == null
                                ? err(new UnauthorizedError('User not found'))
                                : ok({ input, user })
                        )
                    )
                    .map(({ user, input }) => ({
                        email: user.email,
                        oldToken: input.refreshToken,
                        userId: user.id as number,
                    }))
                    .map(({ userId, email, oldToken }) => ({
                        accessToken: generateAccessToken({ email, userId }),
                        expiresAt: new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000
                        ), // 30日後
                        oldToken,
                        refreshToken: generateRefreshToken({ email, userId }),
                        userId,
                    }))
                    .andThen(
                        ({
                            userId,
                            oldToken,
                            accessToken,
                            refreshToken,
                            expiresAt,
                        }) =>
                            deleteRefreshToken(oldToken)
                                .andThen(() =>
                                    insertRefreshToken(
                                        userId,
                                        refreshToken,
                                        expiresAt
                                    )
                                )
                                .map(() => ({
                                    accessToken,
                                    refreshToken,
                                }))
                    )
                    .map(({ accessToken, refreshToken }) =>
                        res.status(200).json({
                            accessToken,
                            refreshToken,
                        })
                    )
            );
    })
);

/**
 * GET /api/auth/me - 現在のユーザー情報取得
 */
authRoutes.get(
    '/me',
    authenticate,
    asyncHandler((req, res) => {
        if (!req.user) {
            return err(new UnauthorizedError('User not authenticated'));
        }

        const userId = req.user.userId;

        return findUserById(userId)
            .andThen((user) =>
                user == null
                    ? err(new UnauthorizedError('User not found'))
                    : ok(user)
            )
            .map((user) =>
                res.status(200).json({
                    created_at: user.created_at,
                    email: user.email,
                    id: user.id,
                    name: user.name,
                })
            );
    })
);
