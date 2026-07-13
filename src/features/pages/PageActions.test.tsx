import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// ShareButton + InviteButton pull in server-state; stub so PageActions renders alone.
vi.mock('./sharingApi', () => ({
  useSetShared: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('./sharesApi', () => ({
  useSetInvite: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useRevokeInvite: () => ({ mutate: vi.fn(), isPending: false }),
}));
import { PageActions } from './PageActions';
import type { PageRecord } from '../../lib/pbClient';

const page = { id: 'p1', title: 'R', favorite: false, fullWidth: false } as PageRecord;

const props = (over = {}) => ({
  page,
  pages: [page],
  onToggleFavorite: vi.fn(),
  onMove: vi.fn(),
  onDuplicate: vi.fn(),
  onExport: vi.fn(),
  onFullWidth: vi.fn(),
  onFont: vi.fn(),
  onDelete: vi.fn(),
  collapse: { hasToggles: false, willCollapse: true, collapseAll: vi.fn() },
  ...over,
});

describe('PageActions collapse-all', () => {
  it('hides the collapse control when the page has no toggles', () => {
    render(<PageActions {...props()} />);
    expect(screen.queryByRole('button', { name: /Collapse all|Expand all/ })).toBeNull();
  });

  it('shows "Collapse all" when a toggle is open and fires the handler', async () => {
    const collapseAll = vi.fn();
    render(
      <PageActions
        {...props({ collapse: { hasToggles: true, willCollapse: true, collapseAll } })}
      />,
    );
    const btn = screen.getByRole('button', { name: '▸ Collapse all' });
    await userEvent.click(btn);
    expect(collapseAll).toHaveBeenCalled();
  });

  it('shows "Expand all" when every toggle is collapsed', () => {
    render(
      <PageActions
        {...props({ collapse: { hasToggles: true, willCollapse: false, collapseAll: vi.fn() } })}
      />,
    );
    expect(screen.getByRole('button', { name: '▾ Expand all' })).toBeInTheDocument();
  });
});
