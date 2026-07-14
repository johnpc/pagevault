import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SidebarFooter } from './SidebarFooter';

const signOut = vi.fn();
const push = vi.fn();

vi.mock('../auth/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'me@x.z' }, signOut }),
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useHistory: () => ({ push }),
}));

const renderFooter = (onHelp = vi.fn()) =>
  render(
    <MemoryRouter>
      <SidebarFooter onHelp={onHelp} />
    </MemoryRouter>,
  );

describe('SidebarFooter', () => {
  it('exposes every footer action as a labeled button', () => {
    renderFooter();
    for (const name of ['Trash', 'Settings', 'Shortcuts', 'Sign out']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('navigates to Trash and Settings', async () => {
    renderFooter();
    await userEvent.click(screen.getByRole('button', { name: 'Trash' }));
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(push).toHaveBeenCalledWith('/trash');
    expect(push).toHaveBeenCalledWith('/settings');
  });

  it('opens shortcuts help and signs out', async () => {
    const onHelp = vi.fn();
    renderFooter(onHelp);
    await userEvent.click(screen.getByRole('button', { name: 'Shortcuts' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onHelp).toHaveBeenCalledOnce();
    expect(signOut).toHaveBeenCalledOnce();
  });
});
