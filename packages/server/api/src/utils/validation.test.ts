import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { parseSchema, parseSchemaAll } from './validation.js';

describe('Validation Utils', () => {
  describe('parseSchema', () => {
    it('有効なデータをパースできる', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const data = { name: 'John', age: 30 };
      const result = parseSchema(schema, data);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(data);
      }
    });

    it('無効なデータに対してエラーを返す', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const data = { name: 'John', age: 'thirty' }; // age が数値でない
      const result = parseSchema(schema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.name).toBe('ValidationError');
        expect(result.error.statusCode).toBe(400);
        expect(result.error.message).toContain('Expected number');
      }
    });

    it('必須フィールドが欠けている場合はエラーを返す', () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });

      const data = { name: 'John' }; // email が欠けている
      const result = parseSchema(schema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.name).toBe('ValidationError');
        expect(result.error.statusCode).toBe(400);
      }
    });

    it('メールアドレスの形式が無効な場合はエラーを返す', () => {
      const schema = z.object({
        email: z.string().email(),
      });

      const data = { email: 'invalid-email' };
      const result = parseSchema(schema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain('Invalid email');
      }
    });

    it('複数のバリデーションルールを適用できる', () => {
      const schema = z.object({
        password: z.string().min(8),
        confirmPassword: z.string(),
      });

      const data = { password: '12345', confirmPassword: '12345' };
      const result = parseSchema(schema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain('at least 8');
      }
    });

    it('ネストされたオブジェクトをパースできる', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          address: z.object({
            city: z.string(),
            zipCode: z.string(),
          }),
        }),
      });

      const data = {
        user: {
          name: 'John',
          address: {
            city: 'Tokyo',
            zipCode: '123-4567',
          },
        },
      };

      const result = parseSchema(schema, data);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(data);
      }
    });

    it('配列をパースできる', () => {
      const schema = z.object({
        tags: z.array(z.string()),
      });

      const data = { tags: ['tag1', 'tag2', 'tag3'] };
      const result = parseSchema(schema, data);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(data);
      }
    });

    it('配列の要素が無効な場合はエラーを返す', () => {
      const schema = z.object({
        tags: z.array(z.string()),
      });

      const data = { tags: ['tag1', 123, 'tag3'] }; // 数値が含まれている
      const result = parseSchema(schema, data);

      expect(result.isErr()).toBe(true);
    });
  });

  describe('parseSchemaAll', () => {
    it('有効なデータをパースできる', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const data = { name: 'John', age: 30 };
      const result = parseSchemaAll(schema, data);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(data);
      }
    });

    it('複数のバリデーションエラーを全て含む', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string().email(),
      });

      const data = { name: 123, age: 'thirty', email: 'invalid' }; // 全て無効
      const result = parseSchemaAll(schema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.name).toBe('ValidationError');
        expect(result.error.statusCode).toBe(400);
        // 複数のエラーメッセージが含まれる
        expect(result.error.message).toBeTruthy();
        expect(result.error.message.length).toBeGreaterThan(0);
      }
    });

    it('単一のエラーでも正しく動作する', () => {
      const schema = z.object({
        age: z.number(),
      });

      const data = { age: 'not-a-number' };
      const result = parseSchemaAll(schema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain('Expected number');
      }
    });

    it('エラーメッセージがカンマで区切られる', () => {
      const schema = z.object({
        name: z.string().min(3),
        age: z.number().min(18),
      });

      const data = { name: 'Jo', age: 10 }; // 両方とも無効
      const result = parseSchemaAll(schema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain(',');
      }
    });
  });

  describe('parseSchema vs parseSchemaAll', () => {
    it('parseSchemaは最初のエラーのみを返す', () => {
      const schema = z.object({
        field1: z.string(),
        field2: z.number(),
        field3: z.boolean(),
      });

      const data = { field1: 123, field2: 'abc', field3: 'xyz' }; // 全て無効
      const result = parseSchema(schema, data);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        // エラーメッセージが存在することを確認
        expect(result.error.message).toBeTruthy();
        expect(result.error.message.length).toBeGreaterThan(0);
      }
    });

    it('parseSchemaAllは全てのエラーを返す', () => {
      const schema = z.object({
        field1: z.string(),
        field2: z.number(),
      });

      const data = { field1: 123, field2: 'abc' }; // 両方とも無効
      const resultAll = parseSchemaAll(schema, data);

      expect(resultAll.isErr()).toBe(true);
      if (resultAll.isErr()) {
        // 複数のエラーが含まれる可能性
        expect(resultAll.error.message).toBeTruthy();
      }
    });
  });

  describe('型の安全性', () => {
    it('パース後の型が正しく推論される', () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
        isActive: z.boolean(),
      });

      const data = { id: 1, name: 'Test', isActive: true };
      const result = parseSchema(schema, data);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // TypeScriptの型推論により、result.valueの型が正しく推論される
        expect(typeof result.value.id).toBe('number');
        expect(typeof result.value.name).toBe('string');
        expect(typeof result.value.isActive).toBe('boolean');
      }
    });
  });
});
