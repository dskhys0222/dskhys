import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './PasswordModal.css';

export function PasswordModal() {
  const { rearmWithPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('パスワードを入力してください');
      return;
    }
    setError('');
    setIsSubmitting(true);

    const success = await rearmWithPassword(password);
    if (!success) {
      setError('パスワードが正しくありません');
    }
    // 成功した場合、AuthContextがキーを更新し、
    // AppContentが再レンダリングされてこのコンポーネントはアンマウントされる
    setIsSubmitting(false);
    setPassword('');
  };

  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        <h2>セッションのロック解除</h2>
        <p>続行するにはパスワードを再入力してください。</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="session-password">パスワード</label>
            <input
              id="session-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'ロック解除中...' : 'ロック解除'}
          </button>
        </form>
      </div>
    </div>
  );
}
