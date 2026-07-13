import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableFilterBar } from './TableFilterBar';
import type { TableData } from '../../lib/pbTypes';

const grid = (over: Partial<TableData> = {}): TableData => ({
  columns: [
    { name: 'Name', type: 'text' },
    { name: 'Age', type: 'number' },
  ],
  rows: [['Ada', '30']],
  ...over,
});

describe('TableFilterBar', () => {
  it('typing a query stores a filter on the chosen column', async () => {
    const save = vi.fn();
    render(<TableFilterBar data={grid()} save={save} />);
    await userEvent.type(screen.getByLabelText('Filter query'), 'a');
    expect(save).toHaveBeenLastCalledWith(
      expect.objectContaining({ filter: { col: 0, query: 'a' } }),
    );
  });

  it('changing the column keeps the current query', async () => {
    const save = vi.fn();
    render(<TableFilterBar data={grid({ filter: { col: 0, query: 'x' } })} save={save} />);
    await userEvent.selectOptions(screen.getByLabelText('Filter column'), '1');
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ filter: { col: 1, query: 'x' } }));
  });

  it('shows a clear button only when a query is active, and clearing removes the filter', async () => {
    const save = vi.fn();
    const { rerender } = render(<TableFilterBar data={grid()} save={save} />);
    expect(screen.queryByLabelText('Clear filter')).not.toBeInTheDocument();
    rerender(<TableFilterBar data={grid({ filter: { col: 0, query: 'x' } })} save={save} />);
    await userEvent.click(screen.getByLabelText('Clear filter'));
    expect(save).toHaveBeenCalledWith(expect.not.objectContaining({ filter: expect.anything() }));
  });
});
