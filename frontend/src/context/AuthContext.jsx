import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('astrovyoma_token');
    const savedUser = localStorage.getItem('astrovyoma_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      authApi.getMe().then(res => {
        setUser(res.data);
        localStorage.setItem('astrovyoma_user', JSON.stringify(res.data));
      }).catch(() => {
        localStorage.removeItem('astrovyoma_token');
        localStorage.removeItem('astrovyoma_user');
        setToken(null);
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function login(userData, tokenValue) {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('astrovyoma_token', tokenValue);
    localStorage.setItem('astrovyoma_user', JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('astrovyoma_token');
    localStorage.removeItem('astrovyoma_user');
  }

  function updateUser(updates) {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('astrovyoma_user', JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
