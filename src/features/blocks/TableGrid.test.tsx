import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableGrid } from './TableGrid';
import type { TableData } from '../../lib/pbTypes';

const data = (): TableData => ({
  columns: [
    { name: 'Task', type: 'text' },
    { name: 'Done', type: 'checkbox' },
  ],
  rows: [['Write', '']],
});

const props = () => ({
  data: data(),
  save: vi.fn(),
  titles: {},
  sort: null,
  onSort: vi.fn(),
});

describe('TableGrid', () => {
  it('renders the grid headers and row cells', () => {
    render(<TableGrid {...props()} />);
    expect(screen.getByDisplayValue('Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Write')).toBeInTheDocument();
  });

  it('adds a row via + Add row', async () => {
    const p = props();
    render(<TableGrid {...p} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Add row' }));
    const saved = p.save.mock.calls.at(-1)![0] as TableData;
    expect(saved.rows).toHaveLength(2);
  });
});
