import { z } from 'zod';

// ユーザー関連のスキーマ
export const UserSchema = z.object({
    created_at: z.string().datetime().optional(),
    email: z.string().email('Invalid email format'),
    id: z.number().int().positive().optional(),
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    password_hash: z.string().optional(),
    updated_at: z.string().datetime().optional(),
});

export const CreateUserSchema = UserSchema.omit({
    created_at: true,
    id: true,
    password_hash: true,
    updated_at: true,
});
export const UpdateUserSchema = CreateUserSchema.partial();

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// 認証関連のスキーマ
export const RegisterSchema = z.object({
    email: z.string().email('Invalid email format'),
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
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
    data: z.any().optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    success: z.boolean(),
});

export type ApiResponse<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};

// リストアイテム関連のスキーマ
export const ListItemSchema = z.object({
    created_at: z.string().datetime().optional(),
    data: z.string().min(1, 'Data is required'),
    id: z.number().int().positive().optional(),
    key: z.string().min(1, 'Key is required'),
    owner_id: z.number().int().positive(),
    updated_at: z.string().datetime().optional(),
});

export const CreateListItemSchema = ListItemSchema.omit({
    created_at: true,
    id: true,
    key: true,
    owner_id: true,
    updated_at: true,
});

export const UpdateListItemSchema = z.object({
    data: z.string().min(1, 'Data is required'),
    key: z.string().min(1, 'Key is required'),
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

// 暗号化ポートフォリオ関連のスキーマ
export const EncryptedPortfolioSchema = z.object({
    auth_tag: z.string().min(1, 'Auth tag is required'),
    created_at: z.string().datetime().optional(),
    encrypted_data: z.string().min(1, 'Encrypted data is required'),
    id: z.number().int().positive().optional(),
    iv: z.string().min(1, 'IV is required'),
    scraped_at: z.string().datetime(),
    updated_at: z.string().datetime().optional(),
    user_id: z.number().int().positive(),
});

export const CreateEncryptedPortfolioSchema = z.object({
    data: z.string().min(1, 'Data is required'),
    iv: z.string().min(1, 'IV is required'),
    scrapedAt: z.string().datetime(),
    tag: z.string().min(1, 'Tag is required'),
});

export type EncryptedPortfolio = z.infer<typeof EncryptedPortfolioSchema>;
export type CreateEncryptedPortfolio = z.infer<
    typeof CreateEncryptedPortfolioSchema
>;
