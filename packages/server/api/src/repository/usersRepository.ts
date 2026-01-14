import { getOne, runQuery } from '../database/connection.js';
import type { User } from '../schemas/index.js';

interface DbUser extends User {
    password_hash: string;
}

export const findUserByEmail = (email: string) => {
    return getOne<DbUser>('SELECT * FROM users WHERE email = ?', [email]);
};

export const findUserById = (userId: number) => {
    return getOne<DbUser>('SELECT * FROM users WHERE id = ?', [userId]);
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

export const updateUserPassword = (userId: number, passwordHash: string) => {
    return runQuery<{ changes: number }>(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [passwordHash, userId]
    );
};
