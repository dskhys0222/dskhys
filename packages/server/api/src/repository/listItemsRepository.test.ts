import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { runQuery } from '../database/connection.js';
import { db } from '../database/db-instance.js';
import {
    deleteListItem,
    findAllListItemsByOwnerId,
    findListItemByKey,
    insertListItem,
    updateListItem,
} from './listItemsRepository.js';

/**
 * テスト用データベースの初期化
 */
const initTestDatabase = async (): Promise<void> => {
    await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).match(
        () => {},
        (error) => {
            throw error;
        }
    );

    await runQuery(`
    CREATE TABLE IF NOT EXISTS list_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL,
      key TEXT NOT NULL UNIQUE,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `).match(
        () => {},
        (error) => {
            throw error;
        }
    );
};

/**
 * テスト用データベースのクリーンアップ
 */
const cleanTestDatabase = async (): Promise<void> => {
    await runQuery('DELETE FROM list_items').match(
        () => {},
        (error) => {
            throw error;
        }
    );
};

/**
 * テスト用データベース接続を閉じる
 */
const closeTestDatabase = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};

describe('ListItems Repository', () => {
    const testOwnerId = 1;

    beforeAll(async () => {
        await initTestDatabase();
    });

    beforeEach(async () => {
        await cleanTestDatabase();
    });

    afterAll(async () => {
        await closeTestDatabase();
    });

    describe('insertListItem', () => {
        it('should insert a new list item successfully', async () => {
            const result = await insertListItem(
                testOwnerId,
                'test-key',
                'test data'
            );

            result.match(
                (inserted) => {
                    expect(inserted.lastID).toBeGreaterThan(0);
                },
                (error) => {
                    throw error;
                }
            );
        });

        it('should fail to insert duplicate key', async () => {
            // 最初のアイテムを挿入
            await insertListItem(testOwnerId, 'duplicate-key', 'test data');

            // 同じキーで2回目の挿入を試みる
            const result = await insertListItem(
                testOwnerId,
                'duplicate-key',
                'test data 2'
            );

            result.match(
                () => {
                    throw new Error('Should have failed');
                },
                (error) => {
                    expect(error).toBeDefined();
                }
            );
        });
    });

    describe('findListItemByKey', () => {
        it('should find an existing list item by key', async () => {
            // アイテムを挿入
            await insertListItem(testOwnerId, 'find-key', 'find data');

            // アイテムを検索
            const result = await findListItemByKey('find-key', testOwnerId);

            result.match(
                (item) => {
                    expect(item).toBeDefined();
                    expect(item?.key).toBe('find-key');
                    expect(item?.data).toBe('find data');
                    expect(item?.owner_id).toBe(testOwnerId);
                },
                (error) => {
                    throw error;
                }
            );
        });

        it('should return null for non-existent key', async () => {
            const result = await findListItemByKey(
                'non-existent-key',
                testOwnerId
            );

            result.match(
                (item) => {
                    expect(item).toBeUndefined();
                },
                (error) => {
                    throw error;
                }
            );
        });

        it('should not find items from different owners', async () => {
            // 別のオーナーのアイテムを挿入
            await insertListItem(999, 'other-owner-key', 'other owner data');

            // 自分のオーナーIDで検索
            const result = await findListItemByKey(
                'other-owner-key',
                testOwnerId
            );

            result.match(
                (item) => {
                    expect(item).toBeUndefined();
                },
                (error) => {
                    throw error;
                }
            );
        });
    });

    describe('findAllListItemsByOwnerId', () => {
        it('should find all items for an owner', async () => {
            // 複数のアイテムを挿入
            await insertListItem(testOwnerId, 'key1', 'data1');
            await insertListItem(testOwnerId, 'key2', 'data2');
            await insertListItem(testOwnerId, 'key3', 'data3');

            const result = await findAllListItemsByOwnerId(testOwnerId);

            result.match(
                (items) => {
                    expect(items).toHaveLength(3);
                    expect(items.map((item) => item.key).sort()).toEqual([
                        'key1',
                        'key2',
                        'key3',
                    ]);
                },
                (error) => {
                    throw error;
                }
            );
        });

        it('should return empty array when no items exist', async () => {
            const result = await findAllListItemsByOwnerId(testOwnerId);

            result.match(
                (items) => {
                    expect(items).toEqual([]);
                },
                (error) => {
                    throw error;
                }
            );
        });

        it('should only return items for the specified owner', async () => {
            // 異なるオーナーのアイテムを挿入
            await insertListItem(testOwnerId, 'owner1-key', 'owner1 data');
            await insertListItem(999, 'owner999-key', 'owner999 data');

            const result = await findAllListItemsByOwnerId(testOwnerId);

            result.match(
                (items) => {
                    expect(items).toHaveLength(1);
                    expect(items[0].key).toBe('owner1-key');
                },
                (error) => {
                    throw error;
                }
            );
        });
    });

    describe('updateListItem', () => {
        it('should update an existing list item', async () => {
            // アイテムを挿入
            await insertListItem(testOwnerId, 'update-key', 'original data');

            // アイテムを更新
            const updateResult = await updateListItem(
                'update-key',
                'updated data',
                testOwnerId
            );

            updateResult.match(
                () => {},
                (error) => {
                    throw error;
                }
            );

            // 更新されたことを確認
            const findResult = await findListItemByKey(
                'update-key',
                testOwnerId
            );

            findResult.match(
                (item) => {
                    expect(item?.data).toBe('updated data');
                },
                (error) => {
                    throw error;
                }
            );
        });

        it('should not update items from different owners', async () => {
            // 別のオーナーのアイテムを挿入
            await insertListItem(999, 'other-owner-key', 'original data');

            // 自分のオーナーIDで更新を試みる
            await updateListItem('other-owner-key', 'hacked data', testOwnerId);

            // 元のデータが変わっていないことを確認
            const result = await findListItemByKey('other-owner-key', 999);

            result.match(
                (item) => {
                    expect(item?.data).toBe('original data');
                },
                (error) => {
                    throw error;
                }
            );
        });
    });

    describe('deleteListItem', () => {
        it('should delete an existing list item', async () => {
            // アイテムを挿入
            await insertListItem(testOwnerId, 'delete-key', 'delete data');

            // アイテムを削除
            const deleteResult = await deleteListItem(
                'delete-key',
                testOwnerId
            );

            deleteResult.match(
                () => {},
                (error) => {
                    throw error;
                }
            );

            // 削除されたことを確認
            const findResult = await findListItemByKey(
                'delete-key',
                testOwnerId
            );

            findResult.match(
                (item) => {
                    expect(item).toBeUndefined();
                },
                (error) => {
                    throw error;
                }
            );
        });

        it('should not delete items from different owners', async () => {
            // 別のオーナーのアイテムを挿入
            await insertListItem(999, 'other-owner-key', 'other owner data');

            // 自分のオーナーIDで削除を試みる
            await deleteListItem('other-owner-key', testOwnerId);

            // アイテムがまだ存在することを確認
            const result = await findListItemByKey('other-owner-key', 999);

            result.match(
                (item) => {
                    expect(item).toBeDefined();
                    expect(item?.data).toBe('other owner data');
                },
                (error) => {
                    throw error;
                }
            );
        });
    });
});
