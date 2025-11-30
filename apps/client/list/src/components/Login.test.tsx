import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as AuthContext from '../contexts/AuthContext';
import { Login } from './Login';

// useAuthをモックする
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Login', () => {
  it('should render login form', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      encryptionKey: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<Login onSwitchToRegister={vi.fn()} />);
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ログイン' })
    ).toBeInTheDocument();
  });

  it('should call login when form is submitted', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      encryptionKey: null,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<Login onSwitchToRegister={vi.fn()} />);
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should display error message when login fails', async () => {
    const mockLogin = vi
      .fn()
      .mockResolvedValue({ success: false, error: 'Invalid credentials' });
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      encryptionKey: null,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<Login onSwitchToRegister={vi.fn()} />);
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should call onSwitchToRegister when link is clicked', () => {
    const onSwitchToRegister = vi.fn();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      encryptionKey: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<Login onSwitchToRegister={onSwitchToRegister} />);
    const linkButton = screen.getByRole('button', { name: '新規登録' });
    fireEvent.click(linkButton);
    expect(onSwitchToRegister).toHaveBeenCalledTimes(1);
  });
});
