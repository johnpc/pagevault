import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PageRecord } from '../../lib/pbClient';

const setShared = { mutateAsync: vi.fn(), mutate: vi.fn(), isPending: false };
vi.mock('./sharingApi', () => ({ useSetShared: () => setShared }));

import { ShareButton } from './ShareButton';

const mk = (over: Partial<PageRecord> = {}): PageRecord =>
  ({
    id: 'p1',
    title: 'T',
    icon: '',
    archived: false,
    favorite: false,
    cover: '',
    isPublic: false,
    shareToken: '',
    sort: 0,
    parent: '',
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'pages',
    ...over,
  }) as PageRecord;

describe('ShareButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it('enables sharing and copies the link', async () => {
    setShared.mutateAsync.mockResolvedValue(mk({ isPublic: true, shareToken: 'tok123' }));
    render(<ShareButton page={mk()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    expect(setShared.mutateAsync).toHaveBeenCalledWith({
      page: expect.any(Object),
      isPublic: true,
    });
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('/shared/tok123'),
      ),
    );
  });

  it('shows copy + unshare controls once public', async () => {
    render(<ShareButton page={mk({ isPublic: true, shareToken: 'tok123' })} />);
    expect(screen.getByRole('button', { name: 'Copy share link' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Unshare' }));
    expect(setShared.mutate).toHaveBeenCalledWith({ page: expect.any(Object), isPublic: false });
  });
});
