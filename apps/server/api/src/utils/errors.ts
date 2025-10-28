import type { NextFunction, Request, Response } from 'express';
import { ResultAsync } from 'neverthrow';
import type { ApiError } from '../middleware/errorHandler.js';

// カスタムエラークラス
export class ValidationError extends Error implements ApiError {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error implements ApiError {
  statusCode = 404;

  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error implements ApiError {
  statusCode = 401;

  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends Error implements ApiError {
  statusCode = 409;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends Error implements ApiError {
  statusCode = 500;

  constructor(message = 'Internal Server Error') {
    super(message);
    this.name = 'InternalServerError';
  }
}

// 非同期エラーハンドリング用のラッパー - neverthrowのResultAsyncを使用
export const asyncHandler = <T>(
  fn: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<T> | ResultAsync<T, ApiError>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = fn(req, res, next);

    if (result instanceof ResultAsync) {
      result
        .match(
          () => {}, // 成功時は何もしない（既にレスポンスが送信されている）
          (error) => next(error) // エラーの場合はnextに渡す
        )
        .catch(next); // 予期せぬエラーの場合
    } else {
      Promise.resolve(result).catch(next);
    }
  };
};
