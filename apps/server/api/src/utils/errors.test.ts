import type { NextFunction, Request, Response } from 'express';
import { err, ok, ResultAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  asyncHandler,
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from './errors.js';

describe('Custom Error Classes', () => {
  describe('ValidationError', () => {
    it('正しいステータスコードとメッセージを設定する', () => {
      const error = new ValidationError('Invalid input');

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
    });

    it('Errorクラスのインスタンスである', () => {
      const error = new ValidationError('Test');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('NotFoundError', () => {
    it('正しいステータスコードとメッセージを設定する', () => {
      const error = new NotFoundError('User');

      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });

    it('リソース名を含むメッセージを生成する', () => {
      const error = new NotFoundError('Post');
      expect(error.message).toBe('Post not found');
    });
  });

  describe('UnauthorizedError', () => {
    it('デフォルトメッセージで正しいステータスコードを設定する', () => {
      const error = new UnauthorizedError();

      expect(error.name).toBe('UnauthorizedError');
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
    });

    it('カスタムメッセージを設定できる', () => {
      const error = new UnauthorizedError('Invalid token');

      expect(error.message).toBe('Invalid token');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ConflictError', () => {
    it('正しいステータスコードとメッセージを設定する', () => {
      const error = new ConflictError('Email already exists');

      expect(error.name).toBe('ConflictError');
      expect(error.message).toBe('Email already exists');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('InternalServerError', () => {
    it('デフォルトメッセージで正しいステータスコードを設定する', () => {
      const error = new InternalServerError();

      expect(error.name).toBe('InternalServerError');
      expect(error.message).toBe('Internal Server Error');
      expect(error.statusCode).toBe(500);
    });

    it('カスタムメッセージを設定できる', () => {
      const error = new InternalServerError('Database connection failed');

      expect(error.message).toBe('Database connection failed');
      expect(error.statusCode).toBe(500);
    });
  });
});

describe('asyncHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe('Promise を返す関数', () => {
    it('成功時は next を呼ばない', async () => {
      const handler = asyncHandler(async (_req, res) => {
        res.json({ success: true });
        return { success: true };
      });

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('Promise が reject された場合は InternalServerError で next を呼ぶ', async () => {
      const handler = asyncHandler(async () => {
        throw new Error('Something went wrong');
      });

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(error).toBeInstanceOf(InternalServerError);
      expect(error.statusCode).toBe(500);
    });
  });

  describe('ResultAsync を返す関数', () => {
    it('成功時は next を呼ばない', async () => {
      const handler = asyncHandler(() => {
        return ResultAsync.fromSafePromise(Promise.resolve({ data: 'test' }));
      });

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('エラー時はエラーで next を呼ぶ', async () => {
      const validationError = new ValidationError('Invalid data');

      const handler = asyncHandler(() => {
        return ResultAsync.fromPromise(
          Promise.reject(validationError),
          (error) => error as ValidationError
        );
      });

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(error).toBe(validationError);
      expect(error.statusCode).toBe(400);
    });

    it('複数のエラータイプを正しく処理できる', async () => {
      const errors = [
        new ValidationError('Validation failed'),
        new NotFoundError('User'),
        new UnauthorizedError('No token'),
        new ConflictError('Already exists'),
        new InternalServerError('Server error'),
      ];

      for (const testError of errors) {
        const handler = asyncHandler(() => {
          return ResultAsync.fromPromise(
            Promise.reject(testError),
            (error) => error as typeof testError
          );
        });

        vi.clearAllMocks();

        await handler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(error).toBe(testError);
      }
    });
  });

  describe('エッジケース', () => {
    it('undefined を返す関数も正しく処理できる', async () => {
      const handler = asyncHandler(async () => {
        // 何も返さない
      });

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('同期的にエラーを throw した場合も InternalServerError で next を呼ぶ', async () => {
      const handler = asyncHandler(() => {
        throw new Error('Sync error');
      });

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(error).toBeInstanceOf(InternalServerError);
    });
  });

  describe('Result を返す関数', () => {
    it('成功時は next を呼ばない', async () => {
      const handler = asyncHandler(() => {
        return ok({ data: 'test' });
      });

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('エラー時はエラーで next を呼ぶ', async () => {
      const validationError = new ValidationError('Invalid data');

      const handler = asyncHandler(() => {
        return err(validationError);
      });

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(error).toBe(validationError);
      expect(error.statusCode).toBe(400);
    });

    it('異なるエラータイプを正しく処理できる', async () => {
      const notFoundError = new NotFoundError('User');

      const handler = asyncHandler(() => {
        return err(notFoundError);
      });

      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(error).toBe(notFoundError);
      expect(error.statusCode).toBe(404);
    });
  });
});
