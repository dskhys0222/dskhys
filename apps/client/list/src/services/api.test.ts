import { ok } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createItem,
  deleteItemApi,
  getItems,
  getMe,
  login,
  logout,
  register,
  updateItem,
} from './api';
import * as storage from './storage';

// storageのモック
vi.mock('./storage');

describe('API Service', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();

    // デフォルトのトークンモック
    vi.spyOn(storage, 'getAuthTokens').mockResolvedValue(
      ok({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })
    );
    vi.spyOn(storage, 'saveAuthTokens').mockResolvedValue(ok(undefined));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Auth API', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        user: { id: 1, name: 'Test', email: 'test@example.com' },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password',
          }),
        })
      );
    });

    it('should handle login failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      const result = await login({
        email: 'test@example.com',
        password: 'wrong',
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().message).toBe('Invalid credentials');
    });

    it('should register successfully', async () => {
      const mockResponse = {
        accessToken: 'access',
        refreshToken: 'refresh',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await register({
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(mockResponse);
    });

    it('should logout successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await logout('refresh-token');

      expect(result.isOk()).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/logout',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
    });

    it('should get user info successfully', async () => {
      const mockUser = { id: 1, name: 'Test', email: 'test@example.com' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const result = await getMe();

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(mockUser);
    });
  });

  describe('Item API', () => {
    it('should create item successfully', async () => {
      const mockItem = { id: 1, key: 'key', data: 'encrypted' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockItem,
      });

      const result = await createItem('encrypted');

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(mockItem);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/item/create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ data: 'encrypted' }),
        })
      );
    });

    it('should get items successfully', async () => {
      const mockItems = [{ id: 1, key: 'key', data: 'encrypted' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockItems,
      });

      const result = await getItems();

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(mockItems);
    });

    it('should update item successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await updateItem('key', 'new-data');

      expect(result.isOk()).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/item/update',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ key: 'key', data: 'new-data' }),
        })
      );
    });

    it('should delete item successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await deleteItemApi('key');

      expect(result.isOk()).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/item/delete?key=key',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token on 401', async () => {
      // 1回目の呼び出しは401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      // リフレッシュトークンの呼び出し
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: 'new-access',
          refreshToken: 'new-refresh',
        }),
      });

      // 2回目の呼び出し（リトライ）は成功
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      const result = await getMe();

      expect(result.isOk()).toBe(true);
      expect(storage.saveAuthTokens).toHaveBeenCalledWith({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
      // 合計3回呼ばれるはず (API call -> Refresh -> Retry API call)
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should fail if refresh fails', async () => {
      // 1回目の呼び出しは401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      // リフレッシュトークンの呼び出しも失敗
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await getMe();

      expect(result.isErr()).toBe(true);
      // リトライされないので2回
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
