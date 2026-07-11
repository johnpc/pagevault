import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColumnsBlock } from './ColumnsBlock';
import type { BlockRecord } from '../../lib/pbClient';
import type { ColumnsData } from '../../lib/pbTypes';

const mk = (data: ColumnsData | null): BlockRecord =>
  ({ id: 'b1', type: 'columns', data }) as unknown as BlockRecord;

describe('ColumnsBlock', () => {
  it('renders one textarea per column, falling back to 2 empty columns', () => {
    render(<ColumnsBlock block={mk(null)} onEdit={vi.fn()} />);
    expect(screen.getByLabelText('Column 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Column 2')).toBeInTheDocument();
    expect(screen.queryByLabelText('Column 3')).not.toBeInTheDocument();
  });

  it('edits a column and patches the data', async () => {
    const onEdit = vi.fn();
    render(<ColumnsBlock block={mk({ cols: ['a', 'b'] })} onEdit={onEdit} />);
    await userEvent.type(screen.getByLabelText('Column 1'), 'X');
    expect(onEdit).toHaveBeenLastCalledWith('b1', { data: { cols: ['aX', 'b'] } });
  });

  it('adds a column (up to 4)', async () => {
    const onEdit = vi.fn();
    render(<ColumnsBlock block={mk({ cols: ['a', 'b'] })} onEdit={onEdit} />);
    await userEvent.click(screen.getByLabelText('Add column'));
    expect(onEdit).toHaveBeenCalledWith('b1', { data: { cols: ['a', 'b', ''] } });
  });

  it('hides the add button at 4 columns', () => {
    render(<ColumnsBlock block={mk({ cols: ['a', 'b', 'c', 'd'] })} onEdit={vi.fn()} />);
    expect(screen.queryByLabelText('Add column')).not.toBeInTheDocument();
  });

  it('deletes a column when there are more than 2', async () => {
    const onEdit = vi.fn();
    render(<ColumnsBlock block={mk({ cols: ['a', 'b', 'c'] })} onEdit={onEdit} />);
    await userEvent.click(screen.getByLabelText('Delete column 2'));
    expect(onEdit).toHaveBeenCalledWith('b1', { data: { cols: ['a', 'c'] } });
  });

  it('hides delete controls at the 2-column minimum', () => {
    render(<ColumnsBlock block={mk({ cols: ['a', 'b'] })} onEdit={vi.fn()} />);
    expect(screen.queryByLabelText('Delete column 1')).not.toBeInTheDocument();
  });
});
