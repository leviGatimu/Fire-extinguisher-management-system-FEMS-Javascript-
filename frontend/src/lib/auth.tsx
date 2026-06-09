import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, tokenStore } from './api';

export type Role = 'ADMIN' | 'INSPECTOR' | 'USER';
export interface AuthUser { id: string; firstName: string; lastName: string; email: string; role: Role; }

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenStore.access) { setLoading(false); return; }
    api.get('/auth/me')
      .then((r) => setUser(r.data.data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const persist = (data: { user: AuthUser; accessToken: string; refreshToken: string }) => {
    tokenStore.set(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    const r = await api.post('/auth/login', { email, password });
    persist(r.data.data);
  };

  const register = async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    const r = await api.post('/auth/register', data);
    persist(r.data.data);
  };

  const logout = () => {
    api.post('/auth/logout', { refreshToken: tokenStore.refresh }).catch(() => {});
    tokenStore.clear();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
