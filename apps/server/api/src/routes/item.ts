import { Router } from 'express';
import { err, ok } from 'neverthrow';
import { authenticate } from '../middleware/authenticate.js';
import {
  deleteListItem,
  findAllListItemsByOwnerId,
  findListItemByKey,
  insertListItem,
  updateListItem,
} from '../repository/listItemsRepository.js';
import {
  CreateListItemSchema,
  DeleteListItemSchema,
  FindOneListItemSchema,
  UpdateListItemSchema,
} from '../schemas/index.js';
import {
  asyncHandler,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors.js';
import { parseSchema } from '../utils/validation.js';

export const itemRoutes = Router();

/**
 * POST /api/item/create - リストアイテムを作成
 * 認証必須
 */
itemRoutes.post(
  '/create',
  authenticate,
  asyncHandler((req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
      return err(new UnauthorizedError('User not authenticated'));
    }

    return parseSchema(CreateListItemSchema, req.body).asyncAndThen((input) =>
      findListItemByKey(input.key, userId)
        .andThen((existingItem) =>
          existingItem == null
            ? ok()
            : err(new ConflictError('Key already exists'))
        )
        .andThen(() => insertListItem(userId, input.key, input.data))
        .map(({ lastID }) =>
          res.status(201).json({
            id: lastID,
            owner_id: userId,
            key: input.key,
            data: input.data,
          })
        )
    );
  })
);

/**
 * GET /api/item/findOne - キーでリストアイテムを1件取得
 * 認証必須
 */
itemRoutes.get(
  '/findOne',
  authenticate,
  asyncHandler((req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
      return err(new UnauthorizedError('User not authenticated'));
    }

    const key = req.query.key as string;

    return parseSchema(FindOneListItemSchema, { key }).asyncAndThen(() =>
      findListItemByKey(key, userId)
        .andThen((item) =>
          item ? ok(item) : err(new NotFoundError('List item'))
        )
        .map((item) => res.json(item))
    );
  })
);

/**
 * GET /api/item/findAll - 全てのリストアイテムを取得
 * 認証必須
 */
itemRoutes.get(
  '/findAll',
  authenticate,
  asyncHandler((req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
      return err(new UnauthorizedError('User not authenticated'));
    }

    return findAllListItemsByOwnerId(userId).map((items) => res.json(items));
  })
);

/**
 * PUT /api/item/update - リストアイテムを更新
 * 認証必須
 */
itemRoutes.put(
  '/update',
  authenticate,
  asyncHandler((req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
      return err(new UnauthorizedError('User not authenticated'));
    }

    return parseSchema(UpdateListItemSchema, req.body).asyncAndThen((input) =>
      findListItemByKey(input.key, userId)
        .andThen((item) =>
          item ? ok(item) : err(new NotFoundError('List item'))
        )
        .andThen(() => updateListItem(input.key, input.data, userId))
        .map(() =>
          res.json({
            message: 'List item updated successfully',
          })
        )
    );
  })
);

/**
 * DELETE /api/item/delete - リストアイテムを削除
 * 認証必須
 */
itemRoutes.delete(
  '/delete',
  authenticate,
  asyncHandler((req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
      return err(new UnauthorizedError('User not authenticated'));
    }

    const key = req.query.key as string;

    return parseSchema(DeleteListItemSchema, { key }).asyncAndThen(() =>
      findListItemByKey(key, userId)
        .andThen((item) =>
          item ? ok(item) : err(new NotFoundError('List item'))
        )
        .andThen(() => deleteListItem(key, userId))
        .map(() =>
          res.json({
            message: 'List item deleted successfully',
          })
        )
    );
  })
);
