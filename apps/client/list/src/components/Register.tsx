import type React from 'react';
import { useId, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { RegisterForm } from '../types';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export function Register({ onSwitchToLogin }: RegisterProps) {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setIsLoading(true);
    const result = await register(form);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || '登録に失敗しました');
    }
  };

  return (
    <div className="auth-container">
      <h2>新規登録</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor={nameId}>名前</label>
          <input
            type="text"
            id={nameId}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
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
          <label htmlFor={passwordId}>パスワード（8文字以上）</label>
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
        <div className="form-group">
          <label htmlFor={confirmPasswordId}>パスワード（確認）</label>
          <input
            type="password"
            id={confirmPasswordId}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={8}
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? '登録中...' : '登録'}
        </button>
      </form>
      <p className="auth-switch">
        すでにアカウントをお持ちの方は{' '}
        <button type="button" onClick={onSwitchToLogin} className="link-button">
          ログイン
        </button>
      </p>
    </div>
  );
}
