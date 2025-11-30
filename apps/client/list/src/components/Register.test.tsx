import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as AuthContext from '../contexts/AuthContext';
import { Register } from './Register';

// useAuthをモックする
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Register', () => {
  it('should render register form', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      encryptionKey: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<Register onSwitchToLogin={vi.fn()} />);
    expect(screen.getByLabelText('名前')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(
      screen.getByLabelText('パスワード（8文字以上）')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード（確認）')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument();
  });

  it('should call register when form is submitted correctly', async () => {
    const mockRegister = vi.fn().mockResolvedValue({ success: true });
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      encryptionKey: null,
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
    });

    render(<Register onSwitchToLogin={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('名前'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード（8文字以上）'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show error when passwords do not match', async () => {
    const mockRegister = vi.fn();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      encryptionKey: null,
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
    });

    render(<Register onSwitchToLogin={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('名前'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード（8文字以上）'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), {
      target: { value: 'password456' },
    });

    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should display error message when register fails', async () => {
    const mockRegister = vi
      .fn()
      .mockResolvedValue({ success: false, error: 'Email already exists' });
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      encryptionKey: null,
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
    });

    render(<Register onSwitchToLogin={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('名前'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText('メールアドレス'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('パスワード（8文字以上）'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('パスワード（確認）'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('should call onSwitchToLogin when link is clicked', () => {
    const onSwitchToLogin = vi.fn();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      encryptionKey: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<Register onSwitchToLogin={onSwitchToLogin} />);
    const linkButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(linkButton);
    expect(onSwitchToLogin).toHaveBeenCalledTimes(1);
  });
});
