'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authApi } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'mpendae_token';
const USER_KEY  = 'mpendae_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first (remember me), then sessionStorage (session only)
    const savedToken = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
    const savedUser  = localStorage.getItem(USER_KEY)  ?? sessionStorage.getItem(USER_KEY);
    if (savedToken && savedUser) {
      setToken(savedToken);
      try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, remember = false) => {
    const res = await authApi.login(email, password);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);

    const store = remember ? localStorage : sessionStorage;
    store.setItem(TOKEN_KEY, newToken);
    store.setItem(USER_KEY, JSON.stringify(newUser));

    // If not remembering, clear any previously remembered session
    if (!remember) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
