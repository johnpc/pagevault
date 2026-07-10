import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const auth = {
  signIn: vi.fn().mockResolvedValue(undefined),
  register: vi.fn().mockResolvedValue(undefined),
  loading: false,
  error: null as string | null,
};
vi.mock('./useAuth', () => ({ useAuth: () => auth }));

import { AuthScreen } from './AuthScreen';

describe('AuthScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.error = null;
  });

  it('signs in with the entered credentials', async () => {
    render(<AuthScreen />);
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.c');
    await userEvent.type(screen.getByLabelText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(auth.signIn).toHaveBeenCalledWith('a@b.c', 'secret');
  });

  it('switches to register mode and creates an account', async () => {
    render(<AuthScreen />);
    await userEvent.click(screen.getByText('Need an account? Register'));
    await userEvent.type(screen.getByLabelText('Email'), 'new@b.c');
    await userEvent.type(screen.getByLabelText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(auth.register).toHaveBeenCalledWith('new@b.c', 'secret');
  });

  it('shows an error message', () => {
    auth.error = 'Invalid login';
    render(<AuthScreen />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid login');
  });
});
