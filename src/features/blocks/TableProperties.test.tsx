import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableProperties } from './TableProperties';
import type { TableData } from '../../lib/pbTypes';

const grid = (over: Partial<TableData> = {}): TableData => ({
  columns: [
    { name: 'A', type: 'text' },
    { name: 'B', type: 'number' },
  ],
  rows: [['1', '2']],
  ...over,
});

describe('TableProperties', () => {
  it('is closed until the button is clicked', async () => {
    render(<TableProperties data={grid()} save={vi.fn()} />);
    expect(screen.queryByLabelText('Column visibility')).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Table properties'));
    expect(screen.getByLabelText('Column visibility')).toBeInTheDocument();
  });

  it('shows a hidden-count badge on the button', () => {
    const data = grid();
    data.columns[1].hidden = true;
    render(<TableProperties data={data} save={vi.fn()} />);
    expect(screen.getByLabelText('Table properties')).toHaveTextContent('1 hidden');
  });

  it('unchecking a column hides it', async () => {
    const save = vi.fn();
    render(<TableProperties data={grid()} save={save} />);
    await userEvent.click(screen.getByLabelText('Table properties'));
    await userEvent.click(screen.getByLabelText('Show column 2'));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: expect.arrayContaining([expect.objectContaining({ name: 'B', hidden: true })]),
      }),
    );
  });

  it('re-checking a hidden column shows it', async () => {
    const data = grid();
    data.columns[1].hidden = true;
    const save = vi.fn();
    render(<TableProperties data={data} save={save} />);
    await userEvent.click(screen.getByLabelText('Table properties'));
    await userEvent.click(screen.getByLabelText('Show column 2'));
    const saved = save.mock.calls[0][0] as TableData;
    expect(saved.columns[1].hidden).toBeUndefined();
  });
});
