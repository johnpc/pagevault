import { Route, Switch } from 'react-router-dom';
import { useAuth } from './features/auth/useAuth';
import { AuthScreen } from './features/auth/AuthScreen';
import { Workspace } from './features/shell/Workspace';
import { SharedPage } from './features/pages/SharedPage';

/**
 * Top-level gate. `/shared/:token` is PUBLIC — anyone with the link sees the
 * read-only page without signing in. Everything else requires auth: signed-out
 * visitors get the auth screen, signed-in users get the workspace shell.
 */
export function AppRoutes() {
  const { user } = useAuth();
  return (
    <Switch>
      <Route exact path="/shared/:token" component={SharedPage} />
      <Route>{user ? <Workspace /> : <AuthScreen />}</Route>
    </Switch>
  );
}
