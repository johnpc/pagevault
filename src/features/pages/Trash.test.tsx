import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PageRecord } from '../../lib/pbClient';

const archived = { data: [] as PageRecord[], isLoading: false, isError: false, refetch: vi.fn() };
const restore = { mutate: vi.fn() };
const remove = { mutate: vi.fn() };
vi.mock('./pagesApi', () => ({
  useArchivedPages: () => archived,
  useRestorePage: () => restore,
  useDeletePage: () => remove,
}));

import { Trash } from './Trash';

const mk = (id: string, title: string): PageRecord =>
  ({
    id,
    title,
    icon: '🗒',
    archived: true,
    sort: 0,
    parent: '',
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'pages',
  }) as PageRecord;

describe('Trash', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    archived.data = [];
  });

  it('shows an empty state when the trash is empty', () => {
    render(<Trash />);
    expect(screen.getByText('Trash is empty')).toBeInTheDocument();
  });

  it('lists archived pages and restores one', async () => {
    archived.data = [mk('p1', 'Old notes')];
    render(<Trash />);
    expect(screen.getByText(/Old notes/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Restore' }));
    expect(restore.mutate).toHaveBeenCalledWith('p1');
  });

  it('permanently deletes a page', async () => {
    archived.data = [mk('p1', 'Old notes')];
    render(<Trash />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete forever' }));
    expect(remove.mutate).toHaveBeenCalledWith('p1');
  });
});
