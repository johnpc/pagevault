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
});
