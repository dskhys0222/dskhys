import bcrypt from 'bcrypt';
import { ResultAsync } from 'neverthrow';
import { InternalServerError } from './errors';

const SALT_ROUNDS = 10;

/**
 * パスワードをハッシュ化
 */
export const hashPassword = (
  password: string
): ResultAsync<string, InternalServerError> => {
  return ResultAsync.fromPromise(
    bcrypt.hash(password, SALT_ROUNDS),
    () => new InternalServerError('Password hashing failed')
  );
};

/**
 * パスワードを検証
 */
export const verifyPassword = (
  password: string,
  hash: string
): ResultAsync<boolean, InternalServerError> => {
  return ResultAsync.fromPromise(
    bcrypt.compare(password, hash),
    () => new InternalServerError('Password verification failed')
  );
};
