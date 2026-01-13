import type { NextFunction, Request, Response } from 'express';

/**
 * リクエスト・レスポンスのロギングミドルウェア
 */
export const loggingMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const startTime = Date.now();
    const { method, path, ip } = req;

    console.log(`[API] → ${method} ${path} from ${ip}`);

    // レスポンス完了時のログ
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        if (statusCode >= 400) {
            console.error(
                `[API] ✗ ${method} ${path} ${statusCode} (${duration}ms)`
            );
        } else {
            console.log(
                `[API] ✓ ${method} ${path} ${statusCode} (${duration}ms)`
            );
        }

        return originalSend.call(this, data);
    };

    next();
};
