import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateAccessToken } from '../utils/jwt.js';
import { authenticate } from './authenticate.js';

describe('authenticate middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('トークンが提供されている場合', () => {
    it('有効なトークンでユーザー情報をリクエストに追加する', () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const token = generateAccessToken(payload);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.user).toEqual({
        userId: payload.userId,
        email: payload.email,
      });
    });

    it('有効なトークンで次のミドルウェアに進む', () => {
      const payload = { userId: 2, email: 'user@example.com' };
      const token = generateAccessToken(payload);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('トークンが提供されていない場合', () => {
    it('Authorizationヘッダーがない場合はエラーを返す', () => {
      mockRequest.headers = {};

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.message).toBe('No token provided');
      expect(error.statusCode).toBe(401);
    });

    it('Bearerスキームがない場合はエラーを返す', () => {
      mockRequest.headers = {
        authorization: 'InvalidScheme token123',
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.message).toBe('No token provided');
      expect(error.statusCode).toBe(401);
    });

    it('トークンが空の場合はエラーを返す', () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(401);
    });
  });

  describe('無効なトークンの場合', () => {
    it('無効な形式のトークンでエラーを返す', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.message).toBe('Token verification failed');
      expect(error.statusCode).toBe(401);
    });

    it('改ざんされたトークンでエラーを返す', () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const token = generateAccessToken(payload);
      const tamperedToken = `${token.slice(0, -5)}xxxxx`;

      mockRequest.headers = {
        authorization: `Bearer ${tamperedToken}`,
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(401);
    });
  });

  describe('エッジケース', () => {
    it('Authorizationヘッダーが小文字の場合も動作する', () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const token = generateAccessToken(payload);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.user).toBeDefined();
    });

    it('Bearerの後に複数のスペースがある場合も動作する', () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const token = generateAccessToken(payload);

      mockRequest.headers = {
        authorization: `Bearer  ${token}`, // スペース2つ
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      // "Bearer "の7文字分を削除するため、スペースが2つあるとトークンが不正になる
      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(401);
    });

    it('異なるユーザーIDとメールアドレスでも動作する', () => {
      const payload = { userId: 999, email: 'admin@example.com' };
      const token = generateAccessToken(payload);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.user).toEqual({
        userId: 999,
        email: 'admin@example.com',
      });
    });
  });
});
