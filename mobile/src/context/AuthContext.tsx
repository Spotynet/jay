import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import * as tokenStorage from '../utils/authTokenStorage';
import type { User } from '../types/user';

export type AuthContextValue = {
  user: User | null;
  isInitializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, passwordConfirm: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function persistTokens(access: string, refresh: string) {
  await tokenStorage.setTokens(access, refresh);
}

async function clearPersistedTokens() {
  await tokenStorage.clearTokens();
}

import { useAuthStore } from '../store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const [isInitializing, setIsInitializing] = useState(true);

  const resolveSession = useCallback(async () => {
    try {
      const access = await tokenStorage.getAccessToken();
      const refresh = await tokenStorage.getRefreshToken();
      if (!access || !refresh) {
        setUser(null);
        return;
      }

      try {
        const me = await authApi.fetchCurrentUser(access);
        setUser(me);
        return;
      } catch {
        const tokens = await authApi.refreshAccessToken(refresh);
        if (!tokens) {
          await clearPersistedTokens();
          setUser(null);
          return;
        }
        await persistTokens(tokens.access, tokens.refresh);
        const me = await authApi.fetchCurrentUser(tokens.access);
        setUser(me);
      }
    } catch {
      await clearPersistedTokens();
      setUser(null);
    }
  }, [setUser]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await resolveSession();
      if (!cancelled) setIsInitializing(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [resolveSession]);
  const signIn = useCallback(async (email: string, password: string) => {
    const data = await authApi.loginWithPassword(email, password);
    await persistTokens(data.access, data.refresh);
    setUser(data.user);
  }, [setUser]);

  const signUp = useCallback(
    async (email: string, password: string, passwordConfirm: string) => {
      const data = await authApi.registerAccount(email, password, passwordConfirm);
      await persistTokens(data.access, data.refresh);
      setUser(data.user);
    },
    [setUser],
  );

  const signOut = useCallback(async () => {
    await clearPersistedTokens();
    setUser(null);
  }, [setUser]);

  // Use the store value for 'user' instead of local state
  const user = useAuthStore((state) => state.user);

  const value = useMemo(
    () => ({ user, isInitializing, signIn, signUp, signOut }),
    [user, isInitializing, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
