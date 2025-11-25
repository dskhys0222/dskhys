import { ResultAsync } from 'neverthrow';
import type {
  AuthTokens,
  ListItem,
  LoginForm,
  LoginResponse,
  RegisterForm,
  RegisterResponse,
  User,
} from '../types';
import { getAuthTokens, saveAuthTokens } from './storage';

const API_BASE = '/api';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type FetchOptions = RequestInit & {
  requireAuth?: boolean;
};

interface RefreshSuccess {
  success: true;
  value: AuthTokens;
}

interface RefreshFailure {
  success: false;
}

type RefreshResult = RefreshSuccess | RefreshFailure;

async function fetchWithAuth(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { requireAuth = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (requireAuth) {
    const tokensResult = await getAuthTokens();
    if (tokensResult.isOk() && tokensResult.value) {
      headers.set('Authorization', `Bearer ${tokensResult.value.accessToken}`);
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // トークンリフレッシュ処理
  if (response.status === 401 && requireAuth) {
    const refreshResult = await tryRefreshToken();
    if (refreshResult.success) {
      // 新しいトークンで再試行
      headers.set('Authorization', `Bearer ${refreshResult.value.accessToken}`);
      return fetch(url, { ...fetchOptions, headers });
    }
  }

  return response;
}

async function tryRefreshToken(): Promise<RefreshResult> {
  const tokensResult = await getAuthTokens();
  if (tokensResult.isErr() || !tokensResult.value) {
    return { success: false };
  }

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokensResult.value.refreshToken }),
    });

    if (!response.ok) {
      return { success: false };
    }

    const newTokens: AuthTokens = await response.json();
    await saveAuthTokens(newTokens);
    return { success: true, value: newTokens };
  } catch {
    return { success: false };
  }
}

// 認証API
export function register(
  data: RegisterForm
): ResultAsync<RegisterResponse, ApiError> {
  return ResultAsync.fromPromise(
    fetchWithAuth(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || 'Registration failed',
          res.status
        );
      }
      return res.json() as Promise<RegisterResponse>;
    }),
    (error) =>
      error instanceof ApiError ? error : new ApiError('Network error', 0)
  );
}

export function login(data: LoginForm): ResultAsync<LoginResponse, ApiError> {
  return ResultAsync.fromPromise(
    fetchWithAuth(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'Login failed', res.status);
      }
      return res.json() as Promise<LoginResponse>;
    }),
    (error) =>
      error instanceof ApiError ? error : new ApiError('Network error', 0)
  );
}

export function logout(refreshToken: string): ResultAsync<void, ApiError> {
  return ResultAsync.fromPromise(
    fetchWithAuth(`${API_BASE}/auth/logout`, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({ refreshToken }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'Logout failed', res.status);
      }
    }),
    (error) =>
      error instanceof ApiError ? error : new ApiError('Network error', 0)
  );
}

export function getMe(): ResultAsync<User, ApiError> {
  return ResultAsync.fromPromise(
    fetchWithAuth(`${API_BASE}/auth/me`, {
      method: 'GET',
      requireAuth: true,
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || 'Failed to get user info',
          res.status
        );
      }
      return res.json() as Promise<User>;
    }),
    (error) =>
      error instanceof ApiError ? error : new ApiError('Network error', 0)
  );
}

// リストアイテムAPI
export function createItem(data: string): ResultAsync<ListItem, ApiError> {
  return ResultAsync.fromPromise(
    fetchWithAuth(`${API_BASE}/item/create`, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({ data }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || 'Failed to create item',
          res.status
        );
      }
      return res.json() as Promise<ListItem>;
    }),
    (error) =>
      error instanceof ApiError ? error : new ApiError('Network error', 0)
  );
}

export function getItems(): ResultAsync<ListItem[], ApiError> {
  return ResultAsync.fromPromise(
    fetchWithAuth(`${API_BASE}/item/findAll`, {
      method: 'GET',
      requireAuth: true,
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || 'Failed to get items',
          res.status
        );
      }
      return res.json() as Promise<ListItem[]>;
    }),
    (error) =>
      error instanceof ApiError ? error : new ApiError('Network error', 0)
  );
}

export function updateItem(
  key: string,
  data: string
): ResultAsync<void, ApiError> {
  return ResultAsync.fromPromise(
    fetchWithAuth(`${API_BASE}/item/update`, {
      method: 'PUT',
      requireAuth: true,
      body: JSON.stringify({ key, data }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || 'Failed to update item',
          res.status
        );
      }
    }),
    (error) =>
      error instanceof ApiError ? error : new ApiError('Network error', 0)
  );
}

export function deleteItemApi(key: string): ResultAsync<void, ApiError> {
  return ResultAsync.fromPromise(
    fetchWithAuth(`${API_BASE}/item/delete?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
      requireAuth: true,
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || 'Failed to delete item',
          res.status
        );
      }
    }),
    (error) =>
      error instanceof ApiError ? error : new ApiError('Network error', 0)
  );
}
