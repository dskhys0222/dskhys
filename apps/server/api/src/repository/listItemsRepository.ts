import { getMany, getOne, runQuery } from '../database/connection.js';
import type { ListItem } from '../schemas/index.js';

/**
 * リストアイテムを作成
 */
export const insertListItem = (ownerId: number, key: string, data: string) => {
  return runQuery<{ lastID: number }>(
    'INSERT INTO list_items (owner_id, key, data) VALUES (?, ?, ?)',
    [ownerId, key, data]
  );
};

/**
 * keyでリストアイテムを検索
 */
export const findListItemByKey = (key: string, ownerId: number) => {
  return getOne<ListItem>(
    'SELECT * FROM list_items WHERE key = ? AND owner_id = ?',
    [key, ownerId]
  );
};

/**
 * オーナーIDで全てのリストアイテムを取得
 */
export const findAllListItemsByOwnerId = (ownerId: number) => {
  return getMany<ListItem>('SELECT * FROM list_items WHERE owner_id = ?', [
    ownerId,
  ]);
};

/**
 * リストアイテムを更新
 */
export const updateListItem = (key: string, data: string, ownerId: number) => {
  return runQuery(
    'UPDATE list_items SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ? AND owner_id = ?',
    [data, key, ownerId]
  );
};

/**
 * リストアイテムを削除
 */
export const deleteListItem = (key: string, ownerId: number) => {
  return runQuery('DELETE FROM list_items WHERE key = ? AND owner_id = ?', [
    key,
    ownerId,
  ]);
};
