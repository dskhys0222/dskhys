import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as AuthContext from '../contexts/AuthContext';
import { Header } from './Header';

// useAuthをモックする
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Header', () => {
  it('should render title', () => {
    // ユーザーがログインしていない状態をモック
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      logout: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      isAuthenticated: false,
      encryptionKey: null,
    });

    render(<Header />);
    expect(screen.getByText('List App')).toBeInTheDocument();
    expect(screen.queryByText('ログアウト')).not.toBeInTheDocument();
  });

  it('should render user name and logout button when logged in', () => {
    const mockLogout = vi.fn();
    // ユーザーがログインしている状態をモック
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 1, name: 'Test User', email: 'test@example.com' },
      logout: mockLogout,
      login: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      isAuthenticated: true,
      encryptionKey: null,
    });

    render(<Header />);
    expect(screen.getByText('List App')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  it('should call logout when logout button is clicked', () => {
    const mockLogout = vi.fn();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 1, name: 'Test User', email: 'test@example.com' },
      logout: mockLogout,
      login: vi.fn(),
      register: vi.fn(),
      isLoading: false,
      isAuthenticated: true,
      encryptionKey: null,
    });

    render(<Header />);
    const logoutButton = screen.getByText('ログアウト');
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
