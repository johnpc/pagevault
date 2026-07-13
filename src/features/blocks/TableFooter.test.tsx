import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableFooter } from './TableFooter';
import type { TableData } from '../../lib/pbTypes';

const grid = (over: Partial<TableData> = {}): TableData => ({
  columns: [
    { name: 'Item', type: 'text' },
    { name: 'Qty', type: 'number' },
  ],
  rows: [
    ['Apples', '3'],
    ['Bananas', '5'],
  ],
  ...over,
});

const wrap = (ui: React.ReactNode) => render(<table>{ui}</table>);

describe('TableFooter', () => {
  it('shows "Calculate" for a column with no summary', () => {
    wrap(<TableFooter data={grid()} save={vi.fn()} />);
    expect(screen.getAllByText('Calculate').length).toBeGreaterThan(0);
  });

  it('renders a column summary result (sum over visible rows)', () => {
    const data = grid({
      columns: [
        { name: 'Item', type: 'text' },
        { name: 'Qty', type: 'number', summary: 'sum' },
      ],
    });
    wrap(<TableFooter data={data} save={vi.fn()} />);
    expect(screen.getByText('8')).toBeInTheDocument(); // 3 + 5
  });

  it('only summarizes VISIBLE rows when a filter is active', () => {
    const data = grid({
      columns: [
        { name: 'Item', type: 'text' },
        { name: 'Qty', type: 'number', summary: 'sum' },
      ],
      filter: { col: 0, query: 'Apple' },
    });
    wrap(<TableFooter data={data} save={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument(); // only Apples row
    expect(screen.queryByText('8')).not.toBeInTheDocument();
  });

  it('picking a summary kind saves it on the column', async () => {
    const save = vi.fn();
    wrap(<TableFooter data={grid()} save={save} />);
    await userEvent.selectOptions(screen.getByLabelText('Summary for column 2'), 'sum');
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: expect.arrayContaining([expect.objectContaining({ summary: 'sum' })]),
      }),
    );
  });
});
