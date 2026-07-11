import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const signOut = vi.fn();
vi.mock('../auth/useAuth', () => ({
  useAuth: () => ({ user: { email: 'me@x.z' }, signOut }),
}));

const exportAll = vi.fn();
vi.mock('./useExportWorkspace', () => ({
  useExportWorkspace: () => ({ exportAll, busy: false }),
}));

import { Settings } from './Settings';

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('shows the account email and the three theme options', () => {
    render(<Settings />);
    expect(screen.getByText('me@x.z')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Light/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Dark/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /System/ })).toBeInTheDocument();
  });

  it('defaults to System selected', () => {
    render(<Settings />);
    expect(screen.getByRole('radio', { name: /System/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('applies a theme choice on click', async () => {
    render(<Settings />);
    await userEvent.click(screen.getByRole('radio', { name: /Dark/ }));
    expect(screen.getByRole('radio', { name: /Dark/ })).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('signs out', async () => {
    render(<Settings />);
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(signOut).toHaveBeenCalled();
  });

  it('exports the workspace on click', async () => {
    render(<Settings />);
    await userEvent.click(screen.getByRole('button', { name: /Export workspace/ }));
    expect(exportAll).toHaveBeenCalled();
  });
});
