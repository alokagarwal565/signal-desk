import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api, setToken, clearToken, isAuthenticated } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('signaldesk_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem('signaldesk_user', JSON.stringify(result.user));
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    await api.register(email, password, name);
    // Auto-login after registration
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    localStorage.removeItem('signaldesk_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user && isAuthenticated(), login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
