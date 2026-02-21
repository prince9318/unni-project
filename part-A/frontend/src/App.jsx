import { useEffect, useState } from 'react';
import { login as loginRequest, register as registerRequest } from './api/auth.js';
import AppShell from './components/layout/AppShell.jsx';
import LoginView from './components/auth/LoginView.jsx';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    const hasToken = Boolean(localStorage.getItem('token'));
    if (!hasToken) {
      localStorage.removeItem('user');
      return null;
    }
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('user');
    }
  }, [token]);

  const isAuthenticated = Boolean(user && token);

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  const handleLogin = async ({ email, password }) => {
    const data = await loginRequest(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const handleRegister = async ({ name, email, password, role }) => {
    const data = await registerRequest({
      name,
      email,
      password,
      role,
    });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return <AppShell user={user} token={token} onLogout={handleLogout} />;
}

export default App;

