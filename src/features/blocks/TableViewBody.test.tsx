import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableViewBody } from './TableViewBody';
import type { TableData, TableViewMode } from '../../lib/pbTypes';

// CalendarView reads the clock for its initial month — pin it.
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-10T12:00:00Z'));
});
afterAll(() => {
  vi.useRealTimers();
});

const data: TableData = {
  columns: [
    { name: 'Task', type: 'text' },
    { name: 'Status', type: 'select', options: ['Todo'] },
    { name: 'Due', type: 'date' },
  ],
  rows: [['Write', 'Todo', '2026-07-15']],
};

const props = (view: TableViewMode) => ({
  view,
  data,
  save: vi.fn(),
  titles: {},
  sort: null,
  onSort: vi.fn(),
});

describe('TableViewBody', () => {
  it('renders the grid + toolbar for the table view', () => {
    render(<TableViewBody {...props('table')} />);
    expect(screen.getByRole('button', { name: '+ Add row' })).toBeInTheDocument();
  });

  it('renders the board for the board view (no toolbar)', () => {
    render(<TableViewBody {...props('board')} />);
    expect(screen.getByText('Todo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '+ Add row' })).not.toBeInTheDocument();
  });

  it('renders gallery cards with the shared toolbar', () => {
    render(<TableViewBody {...props('gallery')} />);
    expect(screen.getByLabelText('Card 1 title')).toBeInTheDocument();
  });

  it('renders the calendar for the calendar view', () => {
    render(<TableViewBody {...props('calendar')} />);
    expect(screen.getByText('July 2026')).toBeInTheDocument();
  });
});
