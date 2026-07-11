import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableBoard } from './TableBoard';
import type { TableData } from '../../lib/pbTypes';

const data = (): TableData => ({
  columns: [
    { name: 'Task', type: 'text' },
    { name: 'Status', type: 'select', options: ['Todo', 'Done'] },
  ],
  rows: [
    ['Write', 'Todo'],
    ['Ship', 'Done'],
  ],
  view: 'board',
});

describe('TableBoard', () => {
  it('renders a column per option (plus the empty group) with card titles', () => {
    render(<TableBoard data={data()} save={vi.fn()} />);
    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Write')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ship')).toBeInTheDocument();
  });

  it('edits a card title and patches the cell', async () => {
    const save = vi.fn();
    render(<TableBoard data={data()} save={save} />);
    await userEvent.type(screen.getByDisplayValue('Write'), '!');
    expect(save).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rows: [
          ['Write!', 'Todo'],
          ['Ship', 'Done'],
        ],
      }),
    );
  });

  it('moves a card to another group on drop', () => {
    const save = vi.fn();
    render(<TableBoard data={data()} save={save} />);
    // Drag the "Write" (Todo) card and drop it on the Done column.
    const card = screen.getByLabelText('Card 1').closest('.pv-board-card')!;
    fireEvent.dragStart(card);
    const doneCol = screen.getByText('Done').closest('.pv-board-col')!;
    fireEvent.drop(doneCol);
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        rows: [
          ['Write', 'Done'],
          ['Ship', 'Done'],
        ],
      }),
    );
  });

  it('a drop with no active drag, and dragOver/dragEnd, are safe no-ops', () => {
    const save = vi.fn();
    render(<TableBoard data={data()} save={save} />);
    const todoCol = screen.getByText('Todo').closest('.pv-board-col') as HTMLElement;
    fireEvent.dragOver(todoCol);
    fireEvent.drop(todoCol); // no card was dragged
    expect(save).not.toHaveBeenCalled();
    // dragStart then dragEnd (cancel) leaves state clean — a later drop no-ops.
    const card = screen.getByLabelText('Card 1').closest('.pv-board-card') as HTMLElement;
    fireEvent.dragStart(card);
    fireEvent.dragEnd(card);
    fireEvent.drop(todoCol);
    expect(save).not.toHaveBeenCalled();
  });

  it('adds a new card into a group with that group value', async () => {
    const save = vi.fn();
    render(<TableBoard data={data()} save={save} />);
    // The Done column's "+ New" adds a row already tagged Done.
    const doneCol = screen.getByText('Done').closest('.pv-board-col') as HTMLElement;
    await userEvent.click(within(doneCol).getByRole('button', { name: '+ New' }));
    const saved = save.mock.calls.at(-1)![0] as TableData;
    expect(saved.rows.at(-1)).toEqual(['', 'Done']);
  });
});
