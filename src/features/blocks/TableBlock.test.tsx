import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableBlock } from './TableBlock';
import type { BlockRecord } from '../../lib/pbClient';
import type { TableData } from '../../lib/pbTypes';

const mk = (data: TableData | null): BlockRecord =>
  ({ id: 'b1', type: 'table', data }) as unknown as BlockRecord;

const grid: TableData = { columns: ['A', 'B'], rows: [['1', '2']] };

describe('TableBlock', () => {
  it('renders headers and cells from the grid data', () => {
    render(<TableBlock block={mk(grid)} onEdit={vi.fn()} />);
    expect(screen.getByLabelText('Column 1 name')).toHaveValue('A');
    expect(screen.getByLabelText('Cell 1,2')).toHaveValue('2');
  });

  it('falls back to an empty 2-column table when data is null', () => {
    render(<TableBlock block={mk(null)} onEdit={vi.fn()} />);
    expect(screen.getByLabelText('Column 1 name')).toHaveValue('Name');
    expect(screen.getByLabelText('Column 2 name')).toHaveValue('Notes');
  });

  it('edits a cell and patches the data', async () => {
    const onEdit = vi.fn();
    render(<TableBlock block={mk(grid)} onEdit={onEdit} />);
    await userEvent.type(screen.getByLabelText('Cell 1,1'), 'X');
    expect(onEdit).toHaveBeenLastCalledWith('b1', {
      data: { columns: ['A', 'B'], rows: [['1X', '2']] },
    });
  });

  it('renames a column header', async () => {
    const onEdit = vi.fn();
    render(<TableBlock block={mk(grid)} onEdit={onEdit} />);
    await userEvent.type(screen.getByLabelText('Column 2 name'), 'X');
    expect(onEdit).toHaveBeenLastCalledWith('b1', {
      data: { columns: ['A', 'BX'], rows: [['1', '2']] },
    });
  });

  it('adds a row', async () => {
    const onEdit = vi.fn();
    render(<TableBlock block={mk(grid)} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Add row' }));
    expect(onEdit).toHaveBeenCalledWith('b1', {
      data: {
        columns: ['A', 'B'],
        rows: [
          ['1', '2'],
          ['', ''],
        ],
      },
    });
  });

  it('adds a column', async () => {
    const onEdit = vi.fn();
    render(<TableBlock block={mk(grid)} onEdit={onEdit} />);
    await userEvent.click(screen.getByLabelText('Add column'));
    expect(onEdit).toHaveBeenCalledWith('b1', {
      data: { columns: ['A', 'B', 'Column 3'], rows: [['1', '2', '']] },
    });
  });

  it('deletes a column', async () => {
    const onEdit = vi.fn();
    render(<TableBlock block={mk(grid)} onEdit={onEdit} />);
    await userEvent.click(screen.getByLabelText('Delete column 1'));
    expect(onEdit).toHaveBeenCalledWith('b1', { data: { columns: ['B'], rows: [['2']] } });
  });

  it('deletes a row', async () => {
    const onEdit = vi.fn();
    const two: TableData = { columns: ['A'], rows: [['1'], ['2']] };
    render(<TableBlock block={mk(two)} onEdit={onEdit} />);
    await userEvent.click(screen.getByLabelText('Delete row 1'));
    expect(onEdit).toHaveBeenCalledWith('b1', { data: { columns: ['A'], rows: [['2']] } });
  });
});
