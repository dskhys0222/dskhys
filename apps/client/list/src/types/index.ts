// ユーザー関連
export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface RegisterResponse extends AuthTokens {}

// リストアイテム関連
export interface ListItem {
  key: string;
  data: string; // 暗号化されたデータ
}

export interface DecryptedListItem {
  key: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// オフライン同期用
export type SyncAction = 'create' | 'update' | 'delete';

export interface PendingSyncItem {
  id: string;
  action: SyncAction;
  key: string;
  data?: string; // 暗号化されたデータ
  timestamp: number;
}

// API エラー
export interface ApiError {
  message: string;
  status?: number;
}

// フォーム
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export interface CreateItemForm {
  title: string;
}
