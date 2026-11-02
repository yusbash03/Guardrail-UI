import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, refreshSession, session } from '../lib/api';
import { AuthResponseSchema, type AuthResponse, type User } from '../lib/schemas';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; displayName: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Clears everything a signed-in session may have left behind (PWA_REQUIREMENTS.md §4). */
async function clearClientState(clearQueries: () => void) {
  clearQueries();
  try {
    sessionStorage.clear();
  } catch {
    // storage unavailable (private mode)
  }
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.includes('precache')).map((k) => caches.delete(k)));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  const apply = useCallback((auth: AuthResponse) => {
    session.set(auth.accessToken);
    setUser(auth.user);
    setStatus('authenticated');
  }, []);

  const expire = useCallback(() => {
    session.set(null);
    setUser(null);
    setStatus('anonymous');
    void clearClientState(() => queryClient.clear());
  }, [queryClient]);

  useEffect(() => {
    session.onExpired(expire);
    session.onRefreshed(apply);
    // Access token lives in memory only; restore it from the httpOnly refresh cookie on boot.
    void refreshSession().then((auth) => (auth ? apply(auth) : setStatus('anonymous')));
  }, [apply, expire]);

  const login = useCallback(
    async (email: string, password: string) => {
      apply(await api('/auth/login', { method: 'POST', body: { email, password }, schema: AuthResponseSchema, anonymous: true }));
    },
    [apply],
  );

  const register = useCallback(
    async (input: { email: string; password: string; displayName: string }) => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      apply(await api('/auth/register', { method: 'POST', body: { ...input, timeZone }, schema: AuthResponseSchema, anonymous: true }));
    },
    [apply],
  );

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } finally {
      expire();
    }
  }, [expire]);

  const value = useMemo(() => ({ status, user, login, register, logout, updateUser: setUser }), [status, user, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
