import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../utils/errors.js';
import { verifyAccessToken } from '../utils/jwt.js';

// Requestオブジェクトを拡張してuserプロパティを追加
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
      };
    }
  }
}

/**
 * 認証ミドルウェア
 * Authorizationヘッダーからアクセストークンを取得して検証
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('No token provided'));
    return;
  }

  const token = authHeader.substring(7); // "Bearer "を除去

  const result = verifyAccessToken(token);

  result.match(
    (decoded) => {
      // トークンが有効な場合、ユーザー情報をリクエストに追加
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
      next();
    },
    (error) => {
      // トークンが無効な場合
      next(new UnauthorizedError(error.message));
    }
  );
};
