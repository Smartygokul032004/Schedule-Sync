import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'faculty' | 'student';
  department?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setOnlineStatus: (isOnline: boolean) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Set user online when they login
  useEffect(() => {
    if (token && user?.role === 'faculty') {
      setOnlineStatus(true);
    }
  }, [token]);

  // Handle window close/reload - set user offline
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (token && user?.role === 'faculty') {
        navigator.sendBeacon('/api/auth/status/offline');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [token, user]);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    if (user?.role === 'faculty') {
      setOnlineStatus(false).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const setOnlineStatus = async (isOnline: boolean) => {
    try {
      const endpoint = isOnline ? '/auth/status/online' : '/auth/status/offline';
      await api.post(endpoint);
      
      if (user) {
        const updatedUser = {
          ...user,
          isOnline,
          lastSeen: new Date().toISOString(),
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to update online status:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, setOnlineStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
