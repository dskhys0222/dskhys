import { errAsync, okAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from './api';
import * as storage from './storage';
import { isOnline, processSyncQueue, setupSyncListener } from './sync';

// モック
vi.mock('./api');
vi.mock('./storage');

describe('Sync Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトでオンライン
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isOnline', () => {
    it('should return true when online', () => {
      expect(isOnline()).toBe(true);
    });

    it('should return false when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });
      expect(isOnline()).toBe(false);
    });
  });

  describe('processSyncQueue', () => {
    const mockSyncItem = {
      id: 'sync1',
      action: 'create' as const,
      key: '1',
      data: 'data',
      timestamp: 1234567890,
    };

    it('should process queue items successfully', async () => {
      vi.spyOn(storage, 'getSyncQueue').mockReturnValue(
        okAsync([mockSyncItem])
      );
      vi.spyOn(storage, 'removeFromSyncQueue').mockReturnValue(
        okAsync(undefined)
      );
      vi.spyOn(api, 'createItem').mockReturnValue(
        okAsync({ id: 1, key: '1', data: 'data' })
      );

      const result = await processSyncQueue();

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBe(1); // 1 item processed
      expect(api.createItem).toHaveBeenCalledWith('data');
      expect(storage.removeFromSyncQueue).toHaveBeenCalledWith('sync1');
    });

    it('should handle update action', async () => {
      const updateItem = { ...mockSyncItem, action: 'update' as const };
      vi.spyOn(storage, 'getSyncQueue').mockReturnValue(okAsync([updateItem]));
      vi.spyOn(storage, 'removeFromSyncQueue').mockReturnValue(
        okAsync(undefined)
      );
      vi.spyOn(api, 'updateItem').mockReturnValue(okAsync(undefined));

      const result = await processSyncQueue();

      expect(result.isOk()).toBe(true);
      expect(api.updateItem).toHaveBeenCalledWith('1', 'data');
    });

    it('should handle delete action', async () => {
      const deleteItem = { ...mockSyncItem, action: 'delete' as const };
      vi.spyOn(storage, 'getSyncQueue').mockReturnValue(okAsync([deleteItem]));
      vi.spyOn(storage, 'removeFromSyncQueue').mockReturnValue(
        okAsync(undefined)
      );
      vi.spyOn(api, 'deleteItemApi').mockReturnValue(okAsync(undefined));

      const result = await processSyncQueue();

      expect(result.isOk()).toBe(true);
      expect(api.deleteItemApi).toHaveBeenCalledWith('1');
    });

    it('should skip failed items and continue', async () => {
      const item1 = { ...mockSyncItem, id: 'sync1' };
      const item2 = { ...mockSyncItem, id: 'sync2', key: '2' };

      vi.spyOn(storage, 'getSyncQueue').mockReturnValue(
        okAsync([item1, item2])
      );
      vi.spyOn(storage, 'removeFromSyncQueue').mockReturnValue(
        okAsync(undefined)
      );

      // item1 fails
      vi.spyOn(api, 'createItem')
        .mockReturnValueOnce(
          errAsync({ message: 'Failed', status: 500, name: 'ApiError' })
        )
        .mockReturnValueOnce(okAsync({ id: 2, key: '2', data: 'data' }));

      const result = await processSyncQueue();

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBe(1); // Only 1 item successfully processed
      // item1 failed, so removeFromSyncQueue should NOT be called for it (or handled differently in implementation)
      // 実装を見ると、成功した場合のみ removeFromSyncQueue が呼ばれるチェーンになっている
      expect(storage.removeFromSyncQueue).not.toHaveBeenCalledWith('sync1');
      expect(storage.removeFromSyncQueue).toHaveBeenCalledWith('sync2');
    });

    it('should return 0 if offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });

      const result = await processSyncQueue();

      expect(result.isOk()).toBe(true); // Offline is not an error for the caller, just 0 processed
      expect(result._unsafeUnwrap()).toBe(0);
      expect(storage.getSyncQueue).not.toHaveBeenCalled();
    });

    it('should return 0 if queue is empty', async () => {
      vi.spyOn(storage, 'getSyncQueue').mockReturnValue(okAsync([]));

      const result = await processSyncQueue();

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBe(0);
    });
  });

  describe('setupSyncListener', () => {
    it('should setup online listener', () => {
      const addEventListener = vi.spyOn(window, 'addEventListener');
      const removeEventListener = vi.spyOn(window, 'removeEventListener');

      const cleanup = setupSyncListener();

      expect(addEventListener).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      );

      cleanup();

      expect(removeEventListener).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      );
    });

    it('should trigger sync immediately if online', () => {
      vi.spyOn(storage, 'getSyncQueue').mockReturnValue(okAsync([]));

      setupSyncListener();

      expect(storage.getSyncQueue).toHaveBeenCalled();
    });
  });
});
