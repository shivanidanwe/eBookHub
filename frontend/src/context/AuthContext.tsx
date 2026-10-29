import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

export type Role = 'USER' | 'AUTHOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
  fullName?: string;
  avatar?: string;
  authorStatus?: string;
  authorId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchDemoRole: (role: 'STUDENT' | 'AUTHOR' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ebookhub_token'));
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('ebookhub_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get<any>('/auth/me');
      if (res.success && res.data) {
        setUser({
          id: res.data.id,
          email: res.data.email,
          role: res.data.role,
          fullName: res.data.profile?.fullName || (res.data.role === 'ADMIN' ? 'Administrator' : 'User'),
          avatar: res.data.profile?.avatar,
          authorStatus: res.data.authorProfile?.status,
          authorId: res.data.authorProfile?.id,
        });
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      localStorage.removeItem('ebookhub_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('ebookhub_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('ebookhub_token');
    setToken(null);
    setUser(null);
  };

  // Quick switcher for demo testing between the 3 roles
  const switchDemoRole = async (role: 'STUDENT' | 'AUTHOR' | 'ADMIN') => {
    const accounts = {
      STUDENT: 'student@demo.ebookhub.invalid',
      AUTHOR: 'author@demo.ebookhub.invalid',
      ADMIN: 'admin@demo.ebookhub.invalid',
    };

    const res = await api.post<any>('/auth/login', {
      email: accounts[role],
      password: 'DemoOnly@123',
    });
    if (res.success && res.data) {
      login(res.data.token, res.data.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
