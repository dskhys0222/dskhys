import type { NextFunction, Request, Response } from 'express';
import type { Result } from 'neverthrow';
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

// 非同期エラーハンドリング用のラッパー - neverthrowのResultとResultAsyncを使用
export const asyncHandler = <T>(
    fn: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => Promise<T> | Result<T, ApiError> | ResultAsync<T, ApiError>
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await fn(req, res, next);

            if (result instanceof ResultAsync) {
                await result.match(
                    () => {}, // 成功時は何もしない（既にレスポンスが送信されている）
                    (error) => next(error) // エラーの場合はnextに渡す
                );
            } else if (
                result &&
                typeof result === 'object' &&
                'isOk' in result
            ) {
                // Result型の処理
                const resultObj = result as Result<T, ApiError>;
                resultObj.match(
                    () => {}, // 成功時は何もしない（既にレスポンスが送信されている）
                    (error) => next(error) // エラーの場合はnextに渡す
                );
            }
        } catch (_error) {
            next(new InternalServerError());
        }
    };
};
