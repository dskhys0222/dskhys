import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  type TokenPayload,
  verifyAccessToken,
  verifyRefreshToken,
} from './jwt.js';

describe('JWT Utils', () => {
  const mockPayload: TokenPayload = {
    userId: 1,
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('アクセストークンを正常に生成できる', () => {
      const token = generateAccessToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('異なるペイロードで異なるトークンが生成される', () => {
      const token1 = generateAccessToken(mockPayload);
      const token2 = generateAccessToken({
        userId: 2,
        email: 'other@example.com',
      });
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRefreshToken', () => {
    it('リフレッシュトークンを正常に生成できる', () => {
      const token = generateRefreshToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('異なるペイロードで異なるトークンが生成される', () => {
      const token1 = generateRefreshToken(mockPayload);
      const token2 = generateRefreshToken({
        userId: 2,
        email: 'other@example.com',
      });
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyAccessToken', () => {
    it('有効なアクセストークンを検証できる', () => {
      const token = generateAccessToken(mockPayload);
      const result = verifyAccessToken(token);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const decoded = result.value;
        expect(decoded.userId).toBe(mockPayload.userId);
        expect(decoded.email).toBe(mockPayload.email);
        expect(decoded.iat).toBeDefined();
        expect(decoded.exp).toBeDefined();
      }
    });

    it('無効なトークンの場合はエラーを返す', () => {
      const result = verifyAccessToken('invalid-token');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('Token verification failed');
        expect(result.error.statusCode).toBe(401);
      }
    });

    it('リフレッシュトークンをアクセストークンとして検証した場合はエラーを返す', () => {
      const refreshToken = generateRefreshToken(mockPayload);
      const result = verifyAccessToken(refreshToken);

      expect(result.isErr()).toBe(true);
    });

    it('空のトークンの場合はエラーを返す', () => {
      const result = verifyAccessToken('');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('Token verification failed');
      }
    });
  });

  describe('verifyRefreshToken', () => {
    it('有効なリフレッシュトークンを検証できる', () => {
      const token = generateRefreshToken(mockPayload);
      const result = verifyRefreshToken(token);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const decoded = result.value;
        expect(decoded.userId).toBe(mockPayload.userId);
        expect(decoded.email).toBe(mockPayload.email);
        expect(decoded.iat).toBeDefined();
        expect(decoded.exp).toBeDefined();
      }
    });

    it('無効なトークンの場合はエラーを返す', () => {
      const result = verifyRefreshToken('invalid-token');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('Token verification failed');
        expect(result.error.statusCode).toBe(401);
      }
    });

    it('アクセストークンをリフレッシュトークンとして検証した場合はエラーを返す', () => {
      const accessToken = generateAccessToken(mockPayload);
      const result = verifyRefreshToken(accessToken);

      expect(result.isErr()).toBe(true);
    });

    it('空のトークンの場合はエラーを返す', () => {
      const result = verifyRefreshToken('');

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('Token verification failed');
      }
    });
  });

  describe('トークンの有効期限', () => {
    it('生成されたトークンに有効期限が設定されている', () => {
      const token = generateAccessToken(mockPayload);
      const result = verifyAccessToken(token);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const decoded = result.value;
        const now = Math.floor(Date.now() / 1000);
        expect(decoded.exp).toBeGreaterThan(now);
        expect(decoded.iat).toBeLessThanOrEqual(now);
      }
    });
  });
});
