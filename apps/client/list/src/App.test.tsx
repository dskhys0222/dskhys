import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import * as AuthContext from './contexts/AuthContext';

// AuthContextをモック
vi.mock('./contexts/AuthContext', async () => {
  const actual = await vi.importActual('./contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

// ListContextをモック
vi.mock('./contexts/ListContext', () => ({
  ListProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useList: vi.fn(),
}));

// 子コンポーネントをモックして、レンダリングされたことを確認しやすくする
vi.mock('./components', () => ({
  Header: () => <div data-testid="header">Header</div>,
  ListItems: () => <div data-testid="list-items">ListItems</div>,
  Login: () => <div data-testid="login">Login</div>,
  Register: () => <div data-testid="register">Register</div>,
}));

describe('App', () => {
  it('should render loading state', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      encryptionKey: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<App />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('should render login page when not authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      encryptionKey: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<App />);
    expect(screen.getByTestId('login')).toBeInTheDocument();
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('should render list page when authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 1, name: 'Test', email: 'test@example.com' },
      isLoading: false,
      isAuthenticated: true,
      encryptionKey: {} as CryptoKey,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<App />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('list-items')).toBeInTheDocument();
    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
  });
});
