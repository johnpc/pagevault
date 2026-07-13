import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableViewToggle } from './TableViewToggle';
import type { TableData } from '../../lib/pbTypes';

const withSelect: TableData = {
  columns: [
    { name: 'T', type: 'text' },
    { name: 'S', type: 'select', options: ['A'] },
  ],
  rows: [],
};
const noSelect: TableData = { columns: [{ name: 'T', type: 'text' }], rows: [] };

describe('TableViewToggle', () => {
  it('marks the current view as selected', () => {
    render(<TableViewToggle data={{ ...withSelect, view: 'board' }} onView={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Board' })).toHaveAttribute('aria-selected', 'true');
  });

  it('switches view on click', async () => {
    const onView = vi.fn();
    render(<TableViewToggle data={withSelect} onView={onView} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Board' }));
    expect(onView).toHaveBeenCalledWith('board');
  });

  it('disables Board when there is no select column', () => {
    render(<TableViewToggle data={noSelect} onView={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Board' })).toBeDisabled();
  });

  it('offers a Gallery view (always enabled) and switches to it', async () => {
    const onView = vi.fn();
    render(<TableViewToggle data={noSelect} onView={onView} />);
    const gallery = screen.getByRole('tab', { name: 'Gallery' });
    expect(gallery).not.toBeDisabled();
    await userEvent.click(gallery);
    expect(onView).toHaveBeenCalledWith('gallery');
  });

  it('disables Calendar without a date column, enables it with one', () => {
    render(<TableViewToggle data={noSelect} onView={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Calendar' })).toBeDisabled();
  });

  it('switches to the calendar view when a date column exists', async () => {
    const onView = vi.fn();
    const withDate: TableData = { columns: [{ name: 'D', type: 'date' }], rows: [] };
    render(<TableViewToggle data={withDate} onView={onView} />);
    const cal = screen.getByRole('tab', { name: 'Calendar' });
    expect(cal).not.toBeDisabled();
    await userEvent.click(cal);
    expect(onView).toHaveBeenCalledWith('calendar');
  });
});
