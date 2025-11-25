import { useState } from 'react';
import { Header, ListItems, Login, Register } from './components';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ListProvider } from './contexts/ListContext';
import './App.css';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);

  if (isLoading) {
    return (
      <div className="app loading-container">
        <div className="loading">読み込み中...</div>
      </div>
    );
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
