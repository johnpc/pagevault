import { createContext } from 'react';
import type { UserRecord } from '../../lib/pbClient';

export interface AuthState {
  user: UserRecord | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);
