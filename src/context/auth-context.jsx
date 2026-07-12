'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '@/lib/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(true);

  // The cookie survives a refresh, so the first thing the app does is ask the
  // server who it is talking to.
  useEffect(() => {
    const controller = new AbortController();

    auth
      .me(controller.signal)
      .then((payload) => setUser(payload.data))
      .catch(() => setUser(null))
      .finally(() => {
        if (!controller.signal.aborted) {
          setRestoring(false);
        }
      });

    return () => controller.abort();
  }, []);

  const signup = useCallback(async (values) => {
    const payload = await auth.signup(values);
    setUser(payload.data);
    return payload.data;
  }, []);

  const login = useCallback(async (values) => {
    const payload = await auth.login(values);
    setUser(payload.data);
    return payload.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, restoring, signup, login, logout }),
    [user, restoring, signup, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
