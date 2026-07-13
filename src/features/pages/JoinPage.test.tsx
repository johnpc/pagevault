import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { InvitePreview } from './sharesApi';

const replace = vi.fn();
vi.mock('react-router-dom', () => ({
  useParams: () => ({ token: 'tok' }),
  useHistory: () => ({ replace }),
}));

const invited: {
  data: InvitePreview | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} = { data: null, isLoading: false, isError: false, refetch: vi.fn() };
const join = {
  mutateAsync: vi.fn().mockResolvedValue({ pageId: 'pg', role: 'edit' }),
  isPending: false,
};
vi.mock('./sharesApi', () => ({
  useInvitedPage: () => invited,
  useJoinPage: () => join,
}));

import { JoinPage } from './JoinPage';

const preview = (over: Partial<InvitePreview> = {}): InvitePreview => ({
  pageId: 'pg',
  title: 'Team notes',
  icon: '',
  role: 'edit',
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  invited.data = preview();
  invited.isLoading = false;
  invited.isError = false;
});

describe('JoinPage', () => {
  it('shows the invited page title and role', () => {
    render(<JoinPage />);
    expect(screen.getByText('Team notes')).toBeInTheDocument();
    expect(screen.getByText(/edit/)).toBeInTheDocument();
  });

  it('joins with the token and navigates into the page', async () => {
    render(<JoinPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Join page' }));
    expect(join.mutateAsync).toHaveBeenCalledWith('tok');
    expect(replace).toHaveBeenCalledWith('/page/pg');
  });

  it('shows a dead-link message when the token resolves to nothing', () => {
    invited.data = null;
    render(<JoinPage />);
    expect(screen.getByText('This invite link is no longer active.')).toBeInTheDocument();
  });
});
