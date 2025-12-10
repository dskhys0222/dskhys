import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { runQuery } from '../database/connection.js';
import { db } from '../database/db-instance.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { insertUser } from '../repository/usersRepository.js';
import { generateAccessToken } from '../utils/jwt.js';
import { hashPassword } from '../utils/password.js';
import { itemRoutes } from './item.js';

const app = express();
app.use(express.json());
app.use('/api/item', itemRoutes);
app.use(errorHandler);

// テスト用のユーザーデータ
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

let testUserId: number;
let testAccessToken: string;

/**
 * テスト用データベースの初期化
 */
const initTestDatabase = async (): Promise<void> => {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).match(
    () => {},
    (error) => {
      throw error;
    }
  );

  await runQuery(`
    CREATE TABLE IF NOT EXISTS list_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL,
      key TEXT NOT NULL UNIQUE,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `).match(
    () => {},
    (error) => {
      throw error;
    }
  );
};

/**
 * テスト用データベースのクリーンアップ
 */
const cleanTestDatabase = async (): Promise<void> => {
  await runQuery('DELETE FROM list_items').match(
    () => {},
    (error) => {
      throw error;
    }
  );
  await runQuery('DELETE FROM users').match(
    () => {},
    (error) => {
      throw error;
    }
  );
};

/**
 * テスト用データベース接続を閉じる
 */
const closeTestDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

describe('Item Routes', () => {
  beforeAll(async () => {
    // テスト用データベースの初期化
    await initTestDatabase();
  });

  beforeEach(async () => {
    // 各テスト前にデータベースをクリーンアップ
    await cleanTestDatabase();

    // テストユーザーを作成
    const passwordHashResult = await hashPassword(testUser.password);
    const passwordHash = passwordHashResult.match(
      (hash) => hash,
      () => {
        throw new Error('Failed to hash password');
      }
    );

    const userResult = await insertUser(
      testUser.name,
      testUser.email,
      passwordHash
    );
    testUserId = userResult.match(
      ({ lastID }) => lastID,
      () => {
        throw new Error('Failed to create user');
      }
    );

    // アクセストークンを生成
    testAccessToken = generateAccessToken({
      userId: testUserId,
      email: testUser.email,
    });
  });

  afterAll(async () => {
    // テスト後にデータベース接続を閉じる
    await closeTestDatabase();
  });

  describe('POST /api/item/create', () => {
    it('should create a new list item successfully', async () => {
      const newItem = {
        data: 'test data',
      };

      const response = await request(app)
        .post('/api/item/create')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send(newItem)
        .expect(201);

      expect(response.body).toMatchObject({
        data: newItem.data,
      });
      expect(response.body.key).toBeDefined();
      expect(response.body.owner_id).toBeUndefined();
      expect(response.body.id).toBeUndefined();
    });

    it('should fail without authentication', async () => {
      const newItem = {
        data: 'test data',
      };

      const response = await request(app)
        .post('/api/item/create')
        .send(newItem)
        .expect(401);

      expect(response.body.error.message).toContain('No token provided');
    });

    it('should fail with missing data', async () => {
      const newItem = {};

      const response = await request(app)
        .post('/api/item/create')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send(newItem)
        .expect(400);

      expect(response.body.error.message).toBeDefined();
    });
  });

  describe('GET /api/item/findOne', () => {
    it('should get a list item by key successfully', async () => {
      const newItem = {
        data: 'test data',
      };

      // アイテムを作成
      const createResponse = await request(app)
        .post('/api/item/create')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send(newItem);

      const key = createResponse.body.key;

      // アイテムを取得
      const response = await request(app)
        .get('/api/item/findOne')
        .query({ key })
        .set('Authorization', `Bearer ${testAccessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        key,
        data: newItem.data,
      });
      expect(response.body.owner_id).toBeUndefined();
      expect(response.body.id).toBeUndefined();
    });

    it('should fail to get non-existent item', async () => {
      const response = await request(app)
        .get('/api/item/findOne')
        .query({ key: 'non-existent-key' })
        .set('Authorization', `Bearer ${testAccessToken}`)
        .expect(404);

      expect(response.body.error.message).toContain('List item not found');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/item/findOne')
        .query({ key: 'test-key' })
        .expect(401);

      expect(response.body.error.message).toContain('No token provided');
    });

    it('should fail with missing key', async () => {
      const response = await request(app)
        .get('/api/item/findOne')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .expect(400);

      expect(response.body.error.message).toBeDefined();
    });
  });

  describe('GET /api/item/findAll', () => {
    it('should get all list items for the user', async () => {
      const items = [{ data: 'data1' }, { data: 'data2' }, { data: 'data3' }];

      // 複数のアイテムを作成
      for (const item of items) {
        await request(app)
          .post('/api/item/create')
          .set('Authorization', `Bearer ${testAccessToken}`)
          .send(item);
      }

      // 全アイテムを取得
      const response = await request(app)
        .get('/api/item/findAll')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('key');
      expect(response.body[0]).toHaveProperty('data');
      expect(response.body[0].owner_id).toBeUndefined();
      expect(response.body[0].id).toBeUndefined();
    });

    it('should return empty array when no items exist', async () => {
      const response = await request(app)
        .get('/api/item/findAll')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/item/findAll').expect(401);

      expect(response.body.error.message).toContain('No token provided');
    });
  });

  describe('PUT /api/item/update', () => {
    it('should update a list item successfully', async () => {
      const newItem = {
        data: 'original data',
      };

      // アイテムを作成
      const createResponse = await request(app)
        .post('/api/item/create')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send(newItem);

      const key = createResponse.body.key;

      // アイテムを更新
      const updatedItem = {
        key,
        data: 'updated data',
      };

      const response = await request(app)
        .put('/api/item/update')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send(updatedItem)
        .expect(200);

      expect(response.body.message).toContain('updated successfully');

      // 更新されたことを確認
      const getResponse = await request(app)
        .get('/api/item/findOne')
        .query({ key })
        .set('Authorization', `Bearer ${testAccessToken}`)
        .expect(200);

      expect(getResponse.body.data).toBe('updated data');
    });

    it('should fail to update non-existent item', async () => {
      const updatedItem = {
        key: 'non-existent-key',
        data: 'updated data',
      };

      const response = await request(app)
        .put('/api/item/update')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send(updatedItem)
        .expect(404);

      expect(response.body.error.message).toContain('List item not found');
    });

    it('should fail without authentication', async () => {
      const updatedItem = {
        key: 'test-key',
        data: 'updated data',
      };

      const response = await request(app)
        .put('/api/item/update')
        .send(updatedItem)
        .expect(401);

      expect(response.body.error.message).toContain('No token provided');
    });

    it('should fail with missing key', async () => {
      const updatedItem = {
        data: 'updated data',
      };

      const response = await request(app)
        .put('/api/item/update')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send(updatedItem)
        .expect(400);

      expect(response.body.error.message).toBeDefined();
    });

    it('should fail with missing data', async () => {
      const updatedItem = {
        key: 'test-key',
      };

      const response = await request(app)
        .put('/api/item/update')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send(updatedItem)
        .expect(400);

      expect(response.body.error.message).toBeDefined();
    });
  });

  describe('DELETE /api/item/delete', () => {
    it('should delete a list item successfully', async () => {
      const newItem = {
        data: 'test data',
      };

      // アイテムを作成
      const createResponse = await request(app)
        .post('/api/item/create')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .send(newItem);

      const key = createResponse.body.key;

      // アイテムを削除
      const response = await request(app)
        .delete('/api/item/delete')
        .query({ key })
        .set('Authorization', `Bearer ${testAccessToken}`)
        .expect(200);

      expect(response.body.message).toContain('deleted successfully');

      // 削除されたことを確認
      await request(app)
        .get('/api/item/findOne')
        .query({ key })
        .set('Authorization', `Bearer ${testAccessToken}`)
        .expect(404);
    });

    it('should fail to delete non-existent item', async () => {
      const response = await request(app)
        .delete('/api/item/delete')
        .query({ key: 'non-existent-key' })
        .set('Authorization', `Bearer ${testAccessToken}`)
        .expect(404);

      expect(response.body.error.message).toContain('List item not found');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete('/api/item/delete')
        .query({ key: 'test-key' })
        .expect(401);

      expect(response.body.error.message).toContain('No token provided');
    });

    it('should fail with missing key', async () => {
      const response = await request(app)
        .delete('/api/item/delete')
        .set('Authorization', `Bearer ${testAccessToken}`)
        .expect(400);

      expect(response.body.error.message).toBeDefined();
    });
  });
});
