import { useAuth } from './features/auth/useAuth';
import { AuthScreen } from './features/auth/AuthScreen';
import { Workspace } from './features/shell/Workspace';

/**
 * Top-level gate: signed-out visitors see the auth screen; signed-in users get
 * the workspace shell. PageVault is account-first (notes are private), so there
 * is no guest surface.
 */
export function AppRoutes() {
  const { user } = useAuth();
  return user ? <Workspace /> : <AuthScreen />;
}
