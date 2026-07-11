import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableBlock } from './TableBlock';
import type { BlockRecord } from '../../lib/pbClient';
import type { TableData, TableColumn } from '../../lib/pbTypes';

const mk = (data: TableData | null): BlockRecord =>
  ({ id: 'b1', type: 'table', data }) as unknown as BlockRecord;

const cols = (...names: string[]): TableColumn[] => names.map((name) => ({ name, type: 'text' }));
const grid: TableData = { columns: cols('A', 'B'), rows: [['1', '2']] };

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
      data: { columns: cols('A', 'B'), rows: [['1X', '2']] },
    });
  });

  it('renames a column header', async () => {
    const onEdit = vi.fn();
    render(<TableBlock block={mk(grid)} onEdit={onEdit} />);
    await userEvent.type(screen.getByLabelText('Column 2 name'), 'X');
    expect(onEdit).toHaveBeenLastCalledWith('b1', {
      data: {
        columns: [
          { name: 'A', type: 'text' },
          { name: 'BX', type: 'text' },
        ],
        rows: [['1', '2']],
      },
    });
  });

  it('changes a column type to number and renders a number input', async () => {
    const onEdit = vi.fn();
    render(<TableBlock block={mk(grid)} onEdit={onEdit} />);
    await userEvent.selectOptions(screen.getByLabelText('Column 1 type'), 'number');
    expect(onEdit).toHaveBeenLastCalledWith('b1', {
      data: {
        columns: [
          { name: 'A', type: 'number' },
          { name: 'B', type: 'text' },
        ],
        rows: [['1', '2']],
      },
    });
  });

  it('renders a checkbox cell for a checkbox column and toggles it', async () => {
    const onEdit = vi.fn();
    const data: TableData = { columns: [{ name: 'Done', type: 'checkbox' }], rows: [['']] };
    render(<TableBlock block={mk(data)} onEdit={onEdit} />);
    const box = screen.getByLabelText('Cell 1,1');
    expect(box).toHaveProperty('type', 'checkbox');
    await userEvent.click(box);
    expect(onEdit).toHaveBeenLastCalledWith('b1', {
      data: { columns: [{ name: 'Done', type: 'checkbox' }], rows: [['true']] },
    });
  });

  it('renders a select cell with the column options', () => {
    const data: TableData = {
      columns: [{ name: 'Tag', type: 'select', options: ['red', 'blue'] }],
      rows: [['blue']],
    };
    render(<TableBlock block={mk(data)} onEdit={vi.fn()} />);
    expect(screen.getByLabelText('Cell 1,1')).toHaveValue('blue');
    expect(screen.getByRole('option', { name: 'red' })).toBeInTheDocument();
  });

  it('adds a row', async () => {
    const onEdit = vi.fn();
    render(<TableBlock block={mk(grid)} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Add row' }));
    expect(onEdit).toHaveBeenCalledWith('b1', {
      data: {
        columns: cols('A', 'B'),
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
      data: { columns: cols('A', 'B', 'Column 3'), rows: [['1', '2', '']] },
    });
  });

  it('deletes a column', async () => {
    const onEdit = vi.fn();
    render(<TableBlock block={mk(grid)} onEdit={onEdit} />);
    await userEvent.click(screen.getByLabelText('Delete column 1'));
    expect(onEdit).toHaveBeenCalledWith('b1', { data: { columns: cols('B'), rows: [['2']] } });
  });

  it('deletes a row', async () => {
    const onEdit = vi.fn();
    const two: TableData = { columns: cols('A'), rows: [['1'], ['2']] };
    render(<TableBlock block={mk(two)} onEdit={onEdit} />);
    await userEvent.click(screen.getByLabelText('Delete row 1'));
    expect(onEdit).toHaveBeenCalledWith('b1', { data: { columns: cols('A'), rows: [['2']] } });
  });
});
