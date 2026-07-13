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
  it('adds a condition row when there are none', async () => {
    const save = vi.fn();
    render(<TableFilterBar data={grid()} save={save} />);
    await userEvent.click(screen.getByLabelText('Add filter'));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ filters: [{ col: 0, query: '' }] }),
    );
  });

  it('typing a query updates that condition', async () => {
    const save = vi.fn();
    render(<TableFilterBar data={grid({ filters: [{ col: 0, query: '' }] })} save={save} />);
    await userEvent.type(screen.getByLabelText('Filter 1 query'), 'a');
    expect(save).toHaveBeenLastCalledWith(
      expect.objectContaining({ filters: [{ col: 0, query: 'a' }] }),
    );
  });

  it('changing a condition column keeps its query', async () => {
    const save = vi.fn();
    render(<TableFilterBar data={grid({ filters: [{ col: 0, query: 'x' }] })} save={save} />);
    await userEvent.selectOptions(screen.getByLabelText('Filter 1 column'), '1');
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ filters: [{ col: 1, query: 'x' }] }),
    );
  });

  it('shows a match all/any toggle with 2+ conditions and switches to OR', async () => {
    const save = vi.fn();
    render(
      <TableFilterBar
        data={grid({
          filters: [
            { col: 0, query: 'a' },
            { col: 1, query: 'b' },
          ],
        })}
        save={save}
      />,
    );
    await userEvent.selectOptions(screen.getByLabelText('Filter match mode'), 'any');
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ filterMatch: 'any' }));
  });

  it('hides the match toggle with a single condition', () => {
    render(<TableFilterBar data={grid({ filters: [{ col: 0, query: 'a' }] })} save={vi.fn()} />);
    expect(screen.queryByLabelText('Filter match mode')).not.toBeInTheDocument();
  });

  it('shows one row per condition and removes one on ×', async () => {
    const save = vi.fn();
    render(
      <TableFilterBar
        data={grid({
          filters: [
            { col: 0, query: 'a' },
            { col: 1, query: 'b' },
          ],
        })}
        save={save}
      />,
    );
    expect(screen.getByLabelText('Filter 1 query')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter 2 query')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Remove filter 2'));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ filters: [{ col: 0, query: 'a' }] }),
    );
  });
});
