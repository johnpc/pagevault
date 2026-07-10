import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

const api = { signIn: vi.fn(), register: vi.fn(), signOut: vi.fn(), currentUser: vi.fn() };
vi.mock('./authApi', () => ({
  signIn: (...a: unknown[]) => api.signIn(...a),
  register: (...a: unknown[]) => api.register(...a),
  signOut: () => api.signOut(),
  currentUser: () => api.currentUser(),
}));

function Probe() {
  const { user, error, signIn, register, signOut } = useAuth();
  return (
    <div>
      <span>user:{user?.id ?? 'none'}</span>
      <span>err:{error ?? 'none'}</span>
      <button onClick={() => signIn('a@b.c', 'pw').catch(() => {})}>in</button>
      <button onClick={() => register('a@b.c', 'pw').catch(() => {})}>reg</button>
      <button onClick={signOut}>out</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </QueryClientProvider>,
  );

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.currentUser.mockReturnValue(null);
  });

  it('signs in and exposes the user', async () => {
    api.signIn.mockResolvedValue({ id: 'u1' });
    renderProbe();
    await userEvent.click(screen.getByText('in'));
    await waitFor(() => expect(screen.getByText('user:u1')).toBeInTheDocument());
  });

  it('surfaces a friendly error on failure', async () => {
    api.signIn.mockRejectedValue(new Error('Bad credentials'));
    renderProbe();
    await userEvent.click(screen.getByText('in'));
    await waitFor(() => expect(screen.getByText('err:Bad credentials')).toBeInTheDocument());
  });

  it('registers then clears on sign out', async () => {
    api.register.mockResolvedValue({ id: 'u9' });
    renderProbe();
    await userEvent.click(screen.getByText('reg'));
    await waitFor(() => expect(screen.getByText('user:u9')).toBeInTheDocument());
    await userEvent.click(screen.getByText('out'));
    await waitFor(() => expect(screen.getByText('user:none')).toBeInTheDocument());
    expect(api.signOut).toHaveBeenCalled();
  });
});
