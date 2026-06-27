import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { err, ok } from 'neverthrow';
import { authenticate } from '../middleware/authenticate.js';
import {
    findEncryptedPortfolioByUserId,
    upsertEncryptedPortfolio,
} from '../repository/portfolioRepository.js';
import {
    deletePortfolioSnapshot,
    getPortfolioSnapshot,
    upsertPortfolioSnapshot,
} from '../repository/portfolioSnapshotRepository.js';
import {
    CreateEncryptedPortfolioSchema,
    UpsertPortfolioSnapshotSchema,
} from '../schemas/index.js';
import {
    asyncHandler,
    ConflictError,
    NotFoundError,
    UnauthorizedError,
} from '../utils/errors.js';
import { parseSchema } from '../utils/validation.js';

export const portfolioRoutes: ExpressRouter = Router();

/**
 * POST /api/portfolio/encrypted - 暗号化ポートフォリオデータを登録
 * 認証必須
 */
portfolioRoutes.post(
    '/encrypted',
    authenticate,
    asyncHandler((req, res) => {
        const userId = req.user?.userId;
        if (!userId) {
            return err(new UnauthorizedError('User not authenticated'));
        }

        return parseSchema(
            CreateEncryptedPortfolioSchema,
            req.body
        ).asyncAndThen((input) => {
            return upsertEncryptedPortfolio(
                userId,
                input.iv,
                input.data,
                input.tag,
                input.scrapedAt
            ).map(() =>
                res.status(201).json({
                    message: 'Portfolio data saved successfully',
                    success: true,
                })
            );
        });
    })
);

/**
 * GET /api/portfolio/encrypted - 暗号化ポートフォリオデータを取得
 * 認証必須
 */
portfolioRoutes.get(
    '/encrypted',
    authenticate,
    asyncHandler((req, res) => {
        const userId = req.user?.userId;
        if (!userId) {
            return err(new UnauthorizedError('User not authenticated'));
        }

        return findEncryptedPortfolioByUserId(userId).andThen((portfolio) => {
            if (!portfolio) {
                return err(new NotFoundError('Portfolio data'));
            }

            return ok(
                res.json({
                    data: portfolio.encrypted_data,
                    iv: portfolio.iv,
                    scrapedAt: portfolio.scraped_at,
                    tag: portfolio.auth_tag,
                    updatedAt: portfolio.updated_at,
                })
            );
        });
    })
);

/**
 * GET /api/portfolio/snapshot - ポートフォリオスナップショットを取得
 * 認証必須
 */
portfolioRoutes.get(
    '/snapshot',
    authenticate,
    asyncHandler((req, res) => {
        const userId = req.user?.userId;
        if (!userId) {
            return err(new UnauthorizedError('User not authenticated'));
        }

        return getPortfolioSnapshot(userId).andThen((snapshot) => {
            if (!snapshot) {
                return err(new NotFoundError('Portfolio snapshot'));
            }

            return ok(
                res.json({
                    data: snapshot.encrypted_data,
                    iv: snapshot.iv,
                    tag: snapshot.auth_tag,
                    updatedAt: snapshot.updated_at,
                })
            );
        });
    })
);

/**
 * PUT /api/portfolio/snapshot - ポートフォリオスナップショットをUpsert
 * 認証必須
 * clientUpdatedAtが指定された場合は楽観的ロックを適用
 */
portfolioRoutes.put(
    '/snapshot',
    authenticate,
    asyncHandler((req, res) => {
        const userId = req.user?.userId;
        if (!userId) {
            return err(new UnauthorizedError('User not authenticated'));
        }

        return parseSchema(
            UpsertPortfolioSnapshotSchema,
            req.body
        ).asyncAndThen((input) => {
            return getPortfolioSnapshot(userId).andThen((existing) => {
                // 楽観的ロックチェック
                if (input.clientUpdatedAt && existing) {
                    const clientTs = new Date(input.clientUpdatedAt).getTime();
                    const serverTs = new Date(
                        existing.updated_at ?? ''
                    ).getTime();
                    if (!Number.isNaN(serverTs) && serverTs > clientTs) {
                        return err(
                            new ConflictError(
                                'Snapshot has been updated by another client'
                            )
                        );
                    }
                }

                const isNew = !existing;
                return upsertPortfolioSnapshot(
                    userId,
                    input.iv,
                    input.data,
                    input.tag
                ).map(() =>
                    res.status(isNew ? 201 : 200).json({
                        message: 'Portfolio snapshot saved successfully',
                        success: true,
                    })
                );
            });
        });
    })
);

/**
 * DELETE /api/portfolio/snapshot - ポートフォリオスナップショットを削除
 * 認証必須
 */
portfolioRoutes.delete(
    '/snapshot',
    authenticate,
    asyncHandler((req, res) => {
        const userId = req.user?.userId;
        if (!userId) {
            return err(new UnauthorizedError('User not authenticated'));
        }

        return deletePortfolioSnapshot(userId).map(() =>
            res.status(204).send()
        );
    })
);
