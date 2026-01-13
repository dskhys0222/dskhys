import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { err, ok } from 'neverthrow';
import { authenticate } from '../middleware/authenticate.js';
import {
    findEncryptedPortfolioByUserId,
    upsertEncryptedPortfolio,
} from '../repository/portfolioRepository.js';
import { CreateEncryptedPortfolioSchema } from '../schemas/index.js';
import {
    asyncHandler,
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
