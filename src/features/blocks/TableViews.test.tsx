import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableViews } from './TableViews';
import type { TableData } from '../../lib/pbTypes';

const grid = (over: Partial<TableData> = {}): TableData => ({
  columns: [
    { name: 'A', type: 'text' },
    { name: 'B', type: 'number' },
  ],
  rows: [['1', '2']],
  ...over,
});

describe('TableViews', () => {
  it('saves the current config under a typed name', async () => {
    const save = vi.fn();
    render(<TableViews data={grid({ filters: [{ col: 0, query: 'x' }] })} save={save} />);
    await userEvent.type(screen.getByLabelText('Save view name'), 'Mine');
    await userEvent.click(screen.getByRole('button', { name: 'Save view' }));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        views: [expect.objectContaining({ name: 'Mine', filters: [{ col: 0, query: 'x' }] })],
      }),
    );
  });

  it('renders a chip per saved view and applies one on click', async () => {
    const save = vi.fn();
    const data = grid({ views: [{ name: 'Board', view: 'board', groupBy: 0 }] });
    render(<TableViews data={data} save={save} />);
    await userEvent.click(screen.getByLabelText('Apply view Board'));
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ view: 'board', groupBy: 0 }));
  });

  it('deletes a saved view', async () => {
    const save = vi.fn();
    const data = grid({ views: [{ name: 'Board' }] });
    render(<TableViews data={data} save={save} />);
    await userEvent.click(screen.getByLabelText('Delete view Board'));
    expect(save).toHaveBeenCalledWith(expect.not.objectContaining({ views: expect.anything() }));
  });
});
