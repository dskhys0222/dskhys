import { err, ok, type Result } from 'neverthrow';
import type { z } from 'zod';
import { ValidationError } from './errors.js';

/**
 * ZodスキーマのsafeParseをResult型に変換するヘルパー関数
 */
export const parseSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Result<T, ValidationError> => {
  const result = schema.safeParse(data);

  if (result.success) {
    return ok(result.data);
  }

  return err(new ValidationError(result.error.errors[0].message));
};

/**
 * 全てのバリデーションエラーメッセージを含めるバージョン
 */
export const parseSchemaAll = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Result<T, ValidationError> => {
  const result = schema.safeParse(data);

  if (result.success) {
    return ok(result.data);
  }

  const messages = result.error.errors.map((e) => e.message).join(', ');
  return err(new ValidationError(messages));
};
