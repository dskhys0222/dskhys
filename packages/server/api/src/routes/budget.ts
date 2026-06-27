import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { err, ok } from 'neverthrow';
import { authenticate } from '../middleware/authenticate.js';
import {
    deleteBudgetSnapshot,
    getBudgetSnapshot,
    upsertBudgetSnapshot,
} from '../repository/budgetSnapshotRepository.js';
import { UpsertBudgetSnapshotSchema } from '../schemas/index.js';
import {
    asyncHandler,
    NotFoundError,
    UnauthorizedError,
} from '../utils/errors.js';
import { parseSchema } from '../utils/validation.js';

export const budgetRoutes: ExpressRouter = Router();

/**
 * GET /api/budget/snapshot - バジェットスナップショットを取得
 * 認証必須
 */
budgetRoutes.get(
    '/snapshot',
    authenticate,
    asyncHandler((req, res) => {
        const userId = req.user?.userId;
        if (!userId) {
            return err(new UnauthorizedError('User not authenticated'));
        }

        return getBudgetSnapshot(userId).andThen((snapshot) => {
            if (!snapshot) {
                return err(new NotFoundError('Budget snapshot'));
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
 * PUT /api/budget/snapshot - バジェットスナップショットをUpsert
 * 認証必須
 */
budgetRoutes.put(
    '/snapshot',
    authenticate,
    asyncHandler((req, res) => {
        const userId = req.user?.userId;
        if (!userId) {
            return err(new UnauthorizedError('User not authenticated'));
        }

        return parseSchema(UpsertBudgetSnapshotSchema, req.body).asyncAndThen(
            (input) => {
                return getBudgetSnapshot(userId).andThen((existing) => {
                    const isNew = !existing;
                    return upsertBudgetSnapshot(
                        userId,
                        input.iv,
                        input.data,
                        input.tag
                    ).map(() =>
                        res.status(isNew ? 201 : 200).json({
                            message: 'Budget snapshot saved successfully',
                            success: true,
                        })
                    );
                });
            }
        );
    })
);

/**
 * DELETE /api/budget/snapshot - バジェットスナップショットを削除
 * 認証必須
 */
budgetRoutes.delete(
    '/snapshot',
    authenticate,
    asyncHandler((req, res) => {
        const userId = req.user?.userId;
        if (!userId) {
            return err(new UnauthorizedError('User not authenticated'));
        }

        return deleteBudgetSnapshot(userId).map(() => res.status(204).send());
    })
);
