import { getOne, runQuery } from '../database/connection';
import type { User } from '../schemas';

interface DbUser extends User {
  password_hash: string;
}

export const findUserByEmail = (email: string) => {
  return getOne<DbUser>('SELECT * FROM users WHERE email = ?', [email]);
};

export const insertUser = (
  name: string,
  email: string,
  passwordHash: string
) => {
  return runQuery<{ lastID: number }>(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );
};
