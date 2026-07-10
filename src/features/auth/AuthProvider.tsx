import { useCallback, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './AuthContext';
import * as api from './authApi';
import type { UserRecord } from '../../lib/pbClient';

/** Extracts a human-readable message from a PocketBase error. */
const message = (e: unknown): string =>
  e instanceof Error && e.message ? e.message : 'Something went wrong. Please try again.';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRecord | null>(() => api.currentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const run = useCallback(
    async (fn: () => Promise<UserRecord>) => {
      setLoading(true);
      setError(null);
      try {
        setUser(await fn());
      } catch (e) {
        setError(message(e));
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [setUser],
  );

  const signIn = useCallback(
    (email: string, pw: string) => run(() => api.signIn(email, pw)),
    [run],
  );
  const register = useCallback(
    (email: string, pw: string) => run(() => api.register(email, pw)),
    [run],
  );
  const signOut = useCallback(() => {
    api.signOut();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
