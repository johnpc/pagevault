import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrashRow } from './TrashRow';
import type { PageRecord } from '../../lib/pbClient';

const page = (over: Partial<PageRecord> = {}): PageRecord =>
  ({
    id: 'p1',
    title: 'Old notes',
    icon: '🗒',
    archived: true,
    parent: '',
    owner: 'u1',
    ...over,
  }) as PageRecord;

const setup = (over: Partial<PageRecord> = {}) => {
  const onRestore = vi.fn();
  const onDelete = vi.fn();
  render(<TrashRow page={page(over)} onRestore={onRestore} onDelete={onDelete} />);
  return { onRestore, onDelete };
};

describe('TrashRow', () => {
  it('shows the title (with a fallback icon) and restores', async () => {
    const { onRestore } = setup({ icon: '' });
    expect(screen.getByText(/📄/)).toBeInTheDocument();
    expect(screen.getByText(/Old notes/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Restore' }));
    expect(onRestore).toHaveBeenCalledWith('p1');
  });

  it('arms on first Delete click and only deletes on Confirm', async () => {
    const { onDelete } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Delete forever' }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Delete forever' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));
    expect(onDelete).toHaveBeenCalledWith('p1');
  });

  it('Cancel disarms back to the Delete forever button', async () => {
    const { onDelete } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Delete forever' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Delete forever' })).toBeInTheDocument();
  });
});
