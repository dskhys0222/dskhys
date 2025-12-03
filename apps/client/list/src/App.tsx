import { useState } from 'react';
import {
  Header,
  ListItems,
  Login,
  PasswordModal,
  Register,
} from './components';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ListProvider } from './contexts/ListContext';
import './App.css';

function AppContent() {
  const { isAuthenticated, isLoading, encryptionKey } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);

  const isLocked = isAuthenticated && !encryptionKey;

  if (isLoading) {
    return (
      <div className="app loading-container">
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (isLocked) {
    return <PasswordModal />;
  }

  if (!isAuthenticated) {
    return (
      <div className="app auth-page">
        {isLoginView ? (
          <Login onSwitchToRegister={() => setIsLoginView(false)} />
        ) : (
          <Register onSwitchToLogin={() => setIsLoginView(true)} />
        )}
      </div>
    );
  }

  return (
    <ListProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <ListItems />
        </main>
      </div>
    </ListProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
