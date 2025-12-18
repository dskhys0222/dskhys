import jwt from 'jsonwebtoken';
import { err, ok, type Result } from 'neverthrow';
import { UnauthorizedError } from './errors.js';

const JWT_ACCESS_SECRET =
    process.env.JWT_ACCESS_SECRET || 'default-access-secret';
const JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface TokenPayload {
    userId: number;
    email: string;
}

export interface DecodedToken extends TokenPayload {
    iat: number;
    exp: number;
}

/**
 * アクセストークンを生成
 */
export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRES_IN as `${number}m`,
    });
};

/**
 * リフレッシュトークンを生成
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN as `${number}d`,
    });
};

/**
 * アクセストークンを検証
 */
export const verifyAccessToken = (
    token: string
): Result<DecodedToken, UnauthorizedError> => {
    try {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as DecodedToken;
        return ok(decoded);
    } catch (_) {
        return err(new UnauthorizedError('Token verification failed'));
    }
};

/**
 * リフレッシュトークンを検証
 */
export const verifyRefreshToken = (
    token: string
): Result<DecodedToken, UnauthorizedError> => {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;
        return ok(decoded);
    } catch (_) {
        return err(new UnauthorizedError('Token verification failed'));
    }
};
