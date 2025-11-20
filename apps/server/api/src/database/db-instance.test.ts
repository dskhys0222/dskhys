import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDatabase } from './db-instance.js';

describe('Database Instance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('データベースインスタンスを取得できる', () => {
    const db = getDatabase();

    expect(db).toBeDefined();
    expect(typeof db.run).toBe('function');
    expect(typeof db.get).toBe('function');
    expect(typeof db.all).toBe('function');
  });

  it('同じインスタンスを返す (シングルトン)', () => {
    const db1 = getDatabase();
    const db2 = getDatabase();

    expect(db1).toBe(db2);
  });
});
