import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <h1>List App</h1>
      {user && (
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <button type="button" onClick={logout} className="logout-button">
            ログアウト
          </button>
        </div>
      )}
    </header>
  );
}
