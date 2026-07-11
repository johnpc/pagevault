import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const auth = { user: null as { id: string } | null };
vi.mock('./features/auth/useAuth', () => ({ useAuth: () => auth }));
vi.mock('./features/auth/AuthScreen', () => ({ AuthScreen: () => <div>auth-screen</div> }));
vi.mock('./features/shell/Workspace', () => ({ Workspace: () => <div>workspace</div> }));
vi.mock('./features/pages/SharedPage', () => ({ SharedPage: () => <div>shared-page</div> }));

import { AppRoutes } from './AppRoutes';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

describe('AppRoutes', () => {
  it('shows the auth screen when signed out', () => {
    auth.user = null;
    renderAt('/');
    expect(screen.getByText('auth-screen')).toBeInTheDocument();
  });

  it('shows the workspace when signed in', () => {
    auth.user = { id: 'u1' };
    renderAt('/');
    expect(screen.getByText('workspace')).toBeInTheDocument();
  });

  it('shows the shared page publicly, even when signed out', () => {
    auth.user = null;
    renderAt('/shared/tok123');
    expect(screen.getByText('shared-page')).toBeInTheDocument();
    expect(screen.queryByText('auth-screen')).not.toBeInTheDocument();
  });
});
