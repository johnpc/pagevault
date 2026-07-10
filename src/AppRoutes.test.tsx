import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const auth = { user: null as { id: string } | null };
vi.mock('./features/auth/useAuth', () => ({ useAuth: () => auth }));
vi.mock('./features/auth/AuthScreen', () => ({ AuthScreen: () => <div>auth-screen</div> }));
vi.mock('./features/shell/Workspace', () => ({ Workspace: () => <div>workspace</div> }));

import { AppRoutes } from './AppRoutes';

describe('AppRoutes', () => {
  it('shows the auth screen when signed out', () => {
    auth.user = null;
    render(<AppRoutes />);
    expect(screen.getByText('auth-screen')).toBeInTheDocument();
  });

  it('shows the workspace when signed in', () => {
    auth.user = { id: 'u1' };
    render(<AppRoutes />);
    expect(screen.getByText('workspace')).toBeInTheDocument();
  });
});
