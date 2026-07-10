import { useContext } from 'react';
import { AuthContext, type AuthState } from './AuthContext';

/** Access the auth state. Must be used within <AuthProvider>. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
