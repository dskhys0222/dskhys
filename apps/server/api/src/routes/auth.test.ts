import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closeDatabase, db } from '../database/connection.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { authRoutes } from './auth.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

// テスト用のユーザーデータ
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

describe('Auth Routes', () => {
  beforeAll(async () => {
    // テスト前にusersテーブルとrefresh_tokensテーブルをクリーンアップ
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM refresh_tokens', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM users', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  afterAll(async () => {
    // データベース接続を閉じる
    await closeDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        name: testUser.name,
        email: testUser.email,
      });
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).toHaveProperty('id');
    });

    it('should fail to register with duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('Email already exists');
    });

    it('should fail to register with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('email');
    });

    it('should fail to register with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'another@example.com',
          password: 'short',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('8 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        name: testUser.name,
        email: testUser.email,
      });
    });

    it('should fail to login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('Invalid credentials');
    });

    it('should fail to login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      accessToken = response.body.accessToken;
    });

    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        name: testUser.name,
        email: testUser.email,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('No token provided');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      refreshToken = response.body.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      // Wait a bit to ensure different timestamps in JWT
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      // Both tokens should be present (rotation)
      expect(typeof response.body.accessToken).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('Invalid refresh token');
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeAll(async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should fail to use refresh token after logout', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'some-token' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
