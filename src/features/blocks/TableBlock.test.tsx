import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// TableBlock reads usePages (for relation-cell titles); stub it so these
// render tests don't need a QueryClient/pb.
vi.mock('../pages/pagesApi', () => ({ usePages: () => ({ data: [] }) }));
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

  it('renders the board view when data.view is board', () => {
    const boardData = {
      columns: [
        { name: 'Task', type: 'text' },
        { name: 'Status', type: 'select', options: ['Todo'] },
      ],
      rows: [['A', 'Todo']],
      view: 'board',
    };
    render(<TableBlock block={mk(boardData as never)} onEdit={vi.fn()} />);
    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A')).toBeInTheDocument();
    // No table header inputs in the board view.
    expect(screen.queryByLabelText('Column 1 name')).not.toBeInTheDocument();
  });

  it('switches to the board view via the toggle', async () => {
    const onEdit = vi.fn();
    const withSelect = {
      columns: [
        { name: 'T', type: 'text' },
        { name: 'S', type: 'select', options: ['A'] },
      ],
      rows: [['x', 'A']],
    };
    render(<TableBlock block={mk(withSelect as never)} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Board' }));
    expect(onEdit).toHaveBeenCalledWith(
      'b1',
      expect.objectContaining({ data: expect.objectContaining({ view: 'board' }) }),
    );
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

  it('duplicates a column', async () => {
    const onEdit = vi.fn();
    render(<TableBlock block={mk(grid)} onEdit={onEdit} />);
    await userEvent.click(screen.getByLabelText('Duplicate column 1'));
    const saved = onEdit.mock.calls.at(-1)![1] as { data: TableData };
    expect(saved.data.columns.map((c) => c.name)).toEqual(['A', 'A', 'B']);
    expect(saved.data.rows).toEqual([['1', '1', '2']]);
  });

  it('sorts rows by a column when its header sort button is clicked', async () => {
    const onEdit = vi.fn();
    const data: TableData = { columns: cols('A'), rows: [['banana'], ['apple'], ['cherry']] };
    render(<TableBlock block={mk(data)} onEdit={onEdit} />);
    await userEvent.click(screen.getByLabelText('Sort by column 1'));
    expect(onEdit).toHaveBeenLastCalledWith('b1', {
      data: { columns: cols('A'), rows: [['apple'], ['banana'], ['cherry']] },
    });
  });

  it('toggles a column sort from ascending to descending on a second click', async () => {
    const onEdit = vi.fn();
    const data: TableData = { columns: cols('A'), rows: [['b'], ['a'], ['c']] };
    render(<TableBlock block={mk(data)} onEdit={onEdit} />);
    const sortBtn = screen.getByLabelText('Sort by column 1');
    await userEvent.click(sortBtn); // asc
    await userEvent.click(sortBtn); // desc
    expect(onEdit).toHaveBeenLastCalledWith('b1', {
      data: { columns: cols('A'), rows: [['c'], ['b'], ['a']] },
    });
  });

  it('deletes a row', async () => {
    const onEdit = vi.fn();
    const two: TableData = { columns: cols('A'), rows: [['1'], ['2']] };
    render(<TableBlock block={mk(two)} onEdit={onEdit} />);
    await userEvent.click(screen.getByLabelText('Delete row 1'));
    expect(onEdit).toHaveBeenCalledWith('b1', { data: { columns: cols('A'), rows: [['2']] } });
  });
});
