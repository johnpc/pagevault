import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { CalendarView } from './CalendarView';
import type { TableData } from '../../lib/pbTypes';

// Pin the clock so the initial month (a wall-clock read in the component) is
// deterministic: July 2026.
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-10T12:00:00Z'));
});
afterAll(() => {
  vi.useRealTimers();
});

const data = (rows: string[][]): TableData => ({
  columns: [
    { name: 'Task', type: 'text' },
    { name: 'Due', type: 'date' },
  ],
  rows,
  view: 'calendar',
});

describe('CalendarView', () => {
  it('shows a prompt when there is no date column', () => {
    render(
      <CalendarView data={{ columns: [{ name: 'X', type: 'text' }], rows: [] }} save={vi.fn()} />,
    );
    expect(screen.getByText(/Add a Date column/)).toBeInTheDocument();
  });

  it('opens on the current month and renders an event on its day', () => {
    render(<CalendarView data={data([['Ship it', '2026-07-15']])} save={vi.fn()} />);
    expect(screen.getByText('July 2026')).toBeInTheDocument();
    expect(screen.getByText('Ship it')).toBeInTheDocument();
  });

  it('navigates to the next and previous month', () => {
    render(<CalendarView data={data([])} save={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Next month'));
    expect(screen.getByText('August 2026')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Previous month'));
    fireEvent.click(screen.getByLabelText('Previous month'));
    expect(screen.getByText('June 2026')).toBeInTheDocument();
  });

  it('adds a row dated to the day when its + is clicked', () => {
    const save = vi.fn();
    render(<CalendarView data={data([])} save={save} />);
    fireEvent.click(screen.getByLabelText('Add on 2026-07-04'));
    const saved = save.mock.calls.at(-1)![0] as TableData;
    expect(saved.rows.at(-1)).toEqual(['', '2026-07-04']);
  });

  it('labels an untitled event', () => {
    render(<CalendarView data={data([['', '2026-07-15']])} save={vi.fn()} />);
    const day = screen.getByLabelText('Add on 2026-07-15').closest('.pv-calendar-day')!;
    expect(within(day as HTMLElement).getByText('Untitled')).toBeInTheDocument();
  });
});
