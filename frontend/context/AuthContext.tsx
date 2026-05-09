'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setAuthToken, clearAuthToken } from '../lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Restore session from in-memory store (survives soft navigation)
    const storedToken = (window as any).__vaultiq_token;
    const storedUser = (window as any).__vaultiq_user;
    if (storedToken && storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    const data = await apiFetch<{ access_token: string; user: User }>('/auth/dev-login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setAuthToken(data.access_token);
    (window as any).__vaultiq_user = data.user;
    setUser(data.user);
    router.push('/dashboard');
  };

  const logout = () => {
    clearAuthToken();
    delete (window as any).__vaultiq_user;
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
