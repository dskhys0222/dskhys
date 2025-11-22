import { z } from 'zod';

// ユーザー関連のスキーマ
export const UserSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email format'),
  password_hash: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  password_hash: true,
  created_at: true,
  updated_at: true,
});
export const UpdateUserSchema = CreateUserSchema.partial();

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// 認証関連のスキーマ
export const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const LogoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type LogoutInput = z.infer<typeof LogoutSchema>;

// API レスポンス用のスキーマ
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// リストアイテム関連のスキーマ
export const ListItemSchema = z.object({
  id: z.number().int().positive().optional(),
  owner_id: z.number().int().positive(),
  key: z.string().min(1, 'Key is required'),
  data: z.string().min(1, 'Data is required'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CreateListItemSchema = ListItemSchema.omit({
  id: true,
  owner_id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateListItemSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  data: z.string().min(1, 'Data is required'),
});

export const FindOneListItemSchema = z.object({
  key: z.string().min(1, 'Key is required'),
});

export const DeleteListItemSchema = z.object({
  key: z.string().min(1, 'Key is required'),
});

export type ListItem = z.infer<typeof ListItemSchema>;
export type CreateListItem = z.infer<typeof CreateListItemSchema>;
export type UpdateListItem = z.infer<typeof UpdateListItemSchema>;
export type FindOneListItem = z.infer<typeof FindOneListItemSchema>;
export type DeleteListItem = z.infer<typeof DeleteListItemSchema>;
