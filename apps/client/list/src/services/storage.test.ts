import * as idb from 'idb-keyval';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addToSyncQueue,
  clearAllItems,
  clearAuthTokens,
  clearSyncQueue,
  clearUser,
  deleteItem,
  getAllItems,
  getAuthTokens,
  getItem,
  getSyncQueue,
  getUser,
  removeFromSyncQueue,
  saveAuthTokens,
  saveItem,
  saveUser,
} from './storage';

// idb-keyvalのモック
vi.mock('idb-keyval');

describe('Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Auth Tokens', () => {
    it('should save auth tokens', async () => {
      const tokens = { accessToken: 'access', refreshToken: 'refresh' };
      vi.spyOn(idb, 'set').mockResolvedValue(undefined);

      const result = await saveAuthTokens(tokens);

      expect(result.isOk()).toBe(true);
      expect(idb.set).toHaveBeenCalledWith('auth_tokens', tokens);
    });

    it('should get auth tokens', async () => {
      const tokens = { accessToken: 'access', refreshToken: 'refresh' };
      vi.spyOn(idb, 'get').mockResolvedValue(tokens);

      const result = await getAuthTokens();

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(tokens);
    });

    it('should clear auth tokens', async () => {
      vi.spyOn(idb, 'del').mockResolvedValue(undefined);

      const result = await clearAuthTokens();

      expect(result.isOk()).toBe(true);
      expect(idb.del).toHaveBeenCalledWith('auth_tokens');
    });
  });

  describe('User', () => {
    it('should save user', async () => {
      const user = { id: 1, name: 'Test', email: 'test@example.com' };
      vi.spyOn(idb, 'set').mockResolvedValue(undefined);

      const result = await saveUser(user);

      expect(result.isOk()).toBe(true);
      expect(idb.set).toHaveBeenCalledWith('user', user);
    });

    it('should get user', async () => {
      const user = { id: 1, name: 'Test', email: 'test@example.com' };
      vi.spyOn(idb, 'get').mockResolvedValue(user);

      const result = await getUser();

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(user);
    });

    it('should clear user', async () => {
      vi.spyOn(idb, 'del').mockResolvedValue(undefined);

      const result = await clearUser();

      expect(result.isOk()).toBe(true);
      expect(idb.del).toHaveBeenCalledWith('user');
    });
  });

  describe('Items', () => {
    const mockItem = {
      key: '1',
      title: 'Test',
      completed: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };

    it('should save item', async () => {
      vi.spyOn(idb, 'set').mockResolvedValue(undefined);

      const result = await saveItem(mockItem);

      expect(result.isOk()).toBe(true);
      expect(idb.set).toHaveBeenCalledWith('item_1', mockItem);
    });

    it('should get item', async () => {
      vi.spyOn(idb, 'get').mockResolvedValue(mockItem);

      const result = await getItem('1');

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(mockItem);
    });

    it('should delete item', async () => {
      vi.spyOn(idb, 'del').mockResolvedValue(undefined);

      const result = await deleteItem('1');

      expect(result.isOk()).toBe(true);
      expect(idb.del).toHaveBeenCalledWith('item_1');
    });

    it('should get all items', async () => {
      vi.spyOn(idb, 'keys').mockResolvedValue([
        'item_1',
        'item_2',
        'other_key',
      ]);
      vi.spyOn(idb, 'get').mockImplementation(async (key) => {
        if (key === 'item_1') return mockItem;
        if (key === 'item_2') return { ...mockItem, key: '2' };
        return undefined;
      });

      const result = await getAllItems();

      expect(result.isOk()).toBe(true);
      const items = result._unsafeUnwrap();
      expect(items).toHaveLength(2);
      expect(items[0].key).toBe('1');
      expect(items[1].key).toBe('2');
    });

    it('should clear all items', async () => {
      vi.spyOn(idb, 'keys').mockResolvedValue([
        'item_1',
        'item_2',
        'other_key',
      ]);
      vi.spyOn(idb, 'del').mockResolvedValue(undefined);

      const result = await clearAllItems();

      expect(result.isOk()).toBe(true);
      expect(idb.del).toHaveBeenCalledWith('item_1');
      expect(idb.del).toHaveBeenCalledWith('item_2');
      expect(idb.del).not.toHaveBeenCalledWith('other_key');
    });
  });

  describe('Sync Queue', () => {
    const mockSyncItem = {
      id: 'sync1',
      action: 'create' as const,
      key: '1',
      data: 'data',
      timestamp: 1234567890,
    };

    it('should add to sync queue', async () => {
      vi.spyOn(idb, 'get').mockResolvedValue([]);
      vi.spyOn(idb, 'set').mockResolvedValue(undefined);

      const result = await addToSyncQueue(mockSyncItem);

      expect(result.isOk()).toBe(true);
      expect(idb.set).toHaveBeenCalledWith('sync_queue', [mockSyncItem]);
    });

    it('should update existing item in sync queue', async () => {
      const existingItem = { ...mockSyncItem, data: 'old' };
      vi.spyOn(idb, 'get').mockResolvedValue([existingItem]);
      vi.spyOn(idb, 'set').mockResolvedValue(undefined);

      const newItem = { ...mockSyncItem, data: 'new' };
      const result = await addToSyncQueue(newItem);

      expect(result.isOk()).toBe(true);
      expect(idb.set).toHaveBeenCalledWith('sync_queue', [newItem]);
    });

    it('should get sync queue', async () => {
      vi.spyOn(idb, 'get').mockResolvedValue([mockSyncItem]);

      const result = await getSyncQueue();

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual([mockSyncItem]);
    });

    it('should remove from sync queue', async () => {
      vi.spyOn(idb, 'get').mockResolvedValue([mockSyncItem]);
      vi.spyOn(idb, 'set').mockResolvedValue(undefined);

      const result = await removeFromSyncQueue('sync1');

      expect(result.isOk()).toBe(true);
      expect(idb.set).toHaveBeenCalledWith('sync_queue', []);
    });

    it('should clear sync queue', async () => {
      vi.spyOn(idb, 'del').mockResolvedValue(undefined);

      const result = await clearSyncQueue();

      expect(result.isOk()).toBe(true);
      expect(idb.del).toHaveBeenCalledWith('sync_queue');
    });
  });
});
