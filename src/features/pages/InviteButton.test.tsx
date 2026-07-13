import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PageRecord } from '../../lib/pbClient';

const setInvite = { mutateAsync: vi.fn(), isPending: false };
const revoke = { mutate: vi.fn() };
vi.mock('./sharesApi', () => ({
  useSetInvite: () => setInvite,
  useRevokeInvite: () => revoke,
}));

import { InviteButton } from './InviteButton';

const mk = (over: Partial<PageRecord> = {}): PageRecord =>
  ({ id: 'p1', title: 'T', inviteToken: '', inviteRole: '', owner: 'u1', ...over }) as PageRecord;

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  setInvite.mutateAsync.mockResolvedValue(mk({ inviteToken: 'tok123', inviteRole: 'edit' }));
});

describe('InviteButton', () => {
  it('opens the role menu and creates an invite at the chosen role', async () => {
    render(<InviteButton page={mk()} />);
    await userEvent.click(screen.getByLabelText('Invite collaborators'));
    await userEvent.click(screen.getByRole('option', { name: 'Can edit' }));
    expect(setInvite.mutateAsync).toHaveBeenCalledWith({ page: expect.anything(), role: 'edit' });
  });

  it('copies the /join link after creating the invite', async () => {
    render(<InviteButton page={mk()} />);
    await userEvent.click(screen.getByLabelText('Invite collaborators'));
    await userEvent.click(screen.getByRole('option', { name: 'Can view' }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/join/tok123'),
    );
  });

  it('shows a revoke action once a link exists and revokes it', async () => {
    render(<InviteButton page={mk({ inviteToken: 'live', inviteRole: 'view' })} />);
    await userEvent.click(screen.getByLabelText('Invite collaborators'));
    await userEvent.click(screen.getByRole('button', { name: 'Revoke link' }));
    expect(revoke.mutate).toHaveBeenCalled();
  });

  it('marks the button when an invite link is active', () => {
    render(<InviteButton page={mk({ inviteToken: 'live', inviteRole: 'edit' })} />);
    expect(screen.getByLabelText('Invite collaborators')).toHaveTextContent('Invite ✓');
  });
});
