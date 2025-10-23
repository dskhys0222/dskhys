import bcrypt from 'bcrypt';
import { ResultAsync } from 'neverthrow';

const SALT_ROUNDS = 10;

/**
 * パスワードをハッシュ化
 */
export const hashPassword = (password: string): ResultAsync<string, Error> => {
  return ResultAsync.fromPromise(bcrypt.hash(password, SALT_ROUNDS), (error) =>
    error instanceof Error ? error : new Error('Password hashing failed')
  );
};

/**
 * パスワードを検証
 */
export const verifyPassword = (
  password: string,
  hash: string
): ResultAsync<boolean, Error> => {
  return ResultAsync.fromPromise(bcrypt.compare(password, hash), (error) =>
    error instanceof Error ? error : new Error('Password verification failed')
  );
};
