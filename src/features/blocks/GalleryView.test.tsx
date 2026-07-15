import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GalleryView } from './GalleryView';
import type { TableData } from '../../lib/pbTypes';

const data = (over: Partial<TableData> = {}): TableData => ({
  columns: [
    { name: 'Task', type: 'text' },
    { name: 'Status', type: 'select', options: ['Todo', 'Done'] },
  ],
  rows: [
    ['Write', 'Todo'],
    ['Ship', 'Done'],
  ],
  view: 'gallery',
  ...over,
});

describe('GalleryView', () => {
  it('renders a card per row with its title and fields', () => {
    render(<GalleryView data={data()} save={vi.fn()} />);
    expect(screen.getByDisplayValue('Write')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ship')).toBeInTheDocument();
    expect(screen.getAllByText('Status')).toHaveLength(2);
    expect(screen.getByText('Todo')).toBeInTheDocument();
  });

  it('edits a card title and patches the right underlying cell', async () => {
    const save = vi.fn();
    render(<GalleryView data={data()} save={save} />);
    await userEvent.type(screen.getByDisplayValue('Ship'), '!');
    expect(save).toHaveBeenLastCalledWith(
      expect.objectContaining({
        rows: [
          ['Write', 'Todo'],
          ['Ship!', 'Done'],
        ],
      }),
    );
  });

  it('adds a new card via + New card', async () => {
    const save = vi.fn();
    render(<GalleryView data={data()} save={save} />);
    await userEvent.click(screen.getByRole('button', { name: '+ New card' }));
    const saved = save.mock.calls.at(-1)![0] as TableData;
    expect(saved.rows).toHaveLength(3);
  });

  it('renders a select field value as a colored tag pill', () => {
    render(<GalleryView data={data()} save={vi.fn()} />);
    expect(screen.getByText('Todo')).toHaveClass('pv-tag');
    expect(screen.getByText('Done')).toHaveClass('pv-tag');
  });

  it('renders each multiselect tag as its own pill', () => {
    const grid = data({
      columns: [
        { name: 'Task', type: 'text' },
        { name: 'Tags', type: 'multiselect', options: ['red', 'blue'] },
      ],
      rows: [['Write', 'red,blue']],
    });
    render(<GalleryView data={grid} save={vi.fn()} />);
    expect(screen.getByText('red')).toHaveClass('pv-tag');
    expect(screen.getByText('blue')).toHaveClass('pv-tag');
  });

  it('shows a dash for an empty field value', () => {
    render(<GalleryView data={data({ rows: [['Solo', '']] })} save={vi.fn()} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('disables the title input when the table has no columns', () => {
    render(<GalleryView data={{ columns: [], rows: [[]] }} save={vi.fn()} />);
    expect(screen.getByLabelText('Card 1 title')).toBeDisabled();
  });
});
