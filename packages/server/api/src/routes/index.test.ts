import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { router } from '../routes/index.js';

const app = express();
app.use(express.json());
app.use('/api', router);

describe('API Routes', () => {
  it('should return API status', async () => {
    const response = await request(app).get('/api/').expect(200);

    expect(response.body).toMatchObject({
      message: 'API is running',
      version: '0.0.1',
    });
    expect(response.body.timestamp).toBeDefined();
  });
});

describe('Health Check', () => {
  it('should return health status', async () => {
    const app = express();
    app.get('/health', (_req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    const response = await request(app).get('/health').expect(200);

    expect(response.body).toMatchObject({
      status: 'OK',
    });
    expect(response.body.timestamp).toBeDefined();
  });
});
