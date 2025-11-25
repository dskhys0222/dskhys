import type React from 'react';
import { useId, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { LoginForm } from '../types';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export function Login({ onSwitchToRegister }: LoginProps) {
  const { login } = useAuth();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const emailId = useId();
  const passwordId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(form);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'ログインに失敗しました');
    }
  };

  return (
    <div className="auth-container">
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor={emailId}>メールアドレス</label>
          <input
            type="email"
            id={emailId}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor={passwordId}>パスワード</label>
          <input
            type="password"
            id={passwordId}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            disabled={isLoading}
            minLength={8}
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      <p className="auth-switch">
        アカウントをお持ちでない方は{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="link-button"
        >
          新規登録
        </button>
      </p>
    </div>
  );
}
