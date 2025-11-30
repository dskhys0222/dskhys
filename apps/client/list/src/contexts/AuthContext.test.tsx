import { act, render, screen } from '@testing-library/react';
import { ok } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../services/api';
import * as storage from '../services/storage';
import * as sync from '../services/sync';
import * as cryptoUtils from '../utils/crypto';
import { AuthProvider, useAuth } from './AuthContext';

// モックの設定
vi.mock('../services/api');
vi.mock('../services/storage');
vi.mock('../utils/crypto');
vi.mock('../services/sync');

// テスト用コンポーネント
function TestComponent() {
  const { user, isAuthenticated, login, logout, register } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && <div data-testid="user-name">{user.name}</div>}
      <button
        type="button"
        onClick={() =>
          login({ email: 'test@example.com', password: 'password' })
        }
      >
        Login
      </button>
      <button
        type="button"
        onClick={() =>
          register({
            name: 'Test',
            email: 'test@example.com',
            password: 'password',
          })
        }
      >
        Register
      </button>
      <button type="button" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック実装
    vi.spyOn(storage, 'getAuthTokens').mockResolvedValue(ok(null));
    vi.spyOn(storage, 'getUser').mockResolvedValue(ok(null));
    vi.spyOn(storage, 'saveAuthTokens').mockResolvedValue(ok(undefined));
    vi.spyOn(storage, 'saveUser').mockResolvedValue(ok(undefined));
    vi.spyOn(storage, 'clearAllData').mockResolvedValue(ok(undefined));
    vi.spyOn(storage, 'getEncryptionSalt').mockResolvedValue(ok(null));
    vi.spyOn(storage, 'saveEncryptionSalt').mockResolvedValue(ok(undefined));

    vi.spyOn(cryptoUtils, 'generateSalt').mockReturnValue(
      new Uint8Array([1, 2, 3])
    );
    vi.spyOn(cryptoUtils, 'encodeSalt').mockReturnValue('salt');
    vi.spyOn(cryptoUtils, 'decodeSalt').mockReturnValue(
      new Uint8Array([1, 2, 3])
    );
    vi.spyOn(cryptoUtils, 'deriveKey').mockResolvedValue(ok({} as CryptoKey));

    vi.spyOn(sync, 'isOnline').mockReturnValue(true);
  });

  it('should initialize with no user', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated'
    );
  });

  it('should initialize with stored user', async () => {
    const mockUser = {
      id: 1,
      name: 'Stored User',
      email: 'stored@example.com',
    };
    vi.spyOn(storage, 'getAuthTokens').mockResolvedValue(
      ok({ accessToken: 'access', refreshToken: 'refresh' })
    );
    vi.spyOn(storage, 'getUser').mockResolvedValue(ok(mockUser));
    vi.spyOn(api, 'getMe').mockResolvedValue(ok(mockUser));

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Authenticated'
    );
    expect(screen.getByTestId('user-name')).toHaveTextContent('Stored User');
  });

  it('should login successfully', async () => {
    const mockUser = { id: 1, name: 'Login User', email: 'login@example.com' };
    vi.spyOn(api, 'login').mockResolvedValue(
      ok({
        user: mockUser,
        accessToken: 'access',
        refreshToken: 'refresh',
      })
    );

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Authenticated'
    );
    expect(screen.getByTestId('user-name')).toHaveTextContent('Login User');
    expect(storage.saveAuthTokens).toHaveBeenCalled();
    expect(storage.saveUser).toHaveBeenCalledWith(mockUser);
  });

  it('should logout successfully', async () => {
    const mockUser = { id: 1, name: 'User', email: 'user@example.com' };
    vi.spyOn(storage, 'getAuthTokens').mockResolvedValue(
      ok({ accessToken: 'access', refreshToken: 'refresh' })
    );
    vi.spyOn(storage, 'getUser').mockResolvedValue(ok(mockUser));
    vi.spyOn(api, 'getMe').mockResolvedValue(ok(mockUser));
    vi.spyOn(api, 'logout').mockResolvedValue(ok(undefined));

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Authenticated'
    );

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent(
      'Not Authenticated'
    );
    expect(storage.clearAllData).toHaveBeenCalled();
  });
});
