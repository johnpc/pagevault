import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const pagesData = [
  { id: 'p1', title: 'Roadmap' },
  { id: 'p2', title: '' }, // untitled → displayTitle fallback
];
vi.mock('../pages/pagesApi', () => ({ usePages: () => ({ data: pagesData }) }));

import { RelationCell } from './RelationCell';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RelationCell', () => {
  it('shows a dash when nothing is linked', () => {
    render(<RelationCell value="" label="rel" onChange={vi.fn()} />);
    expect(screen.getByLabelText('rel')).toHaveTextContent('—');
  });

  it('renders the linked page title', () => {
    render(<RelationCell value="p1" label="rel" onChange={vi.fn()} />);
    expect(screen.getByLabelText('rel')).toHaveTextContent('Roadmap');
  });

  it('shows a broken-link indicator (not a blank dash) when the target is gone', () => {
    // value points at a page id not in the list (deleted/archived).
    render(<RelationCell value="ghost" label="rel" onChange={vi.fn()} />);
    const btn = screen.getByLabelText('rel');
    expect(btn).toHaveTextContent('Broken link');
    expect(btn).not.toHaveTextContent('—');
  });

  it('lets you clear a broken link', async () => {
    const onChange = vi.fn();
    render(<RelationCell value="ghost" label="rel" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('rel'));
    await userEvent.click(screen.getByText('Clear'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('opens a picker and links a page by id', async () => {
    const onChange = vi.fn();
    render(<RelationCell value="" label="rel" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('rel'));
    await userEvent.click(screen.getByRole('option', { name: 'Roadmap' }));
    expect(onChange).toHaveBeenCalledWith('p1');
  });

  it('offers Clear only when something is linked, and clears it', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<RelationCell value="" label="rel" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('rel'));
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    rerender(<RelationCell value="p1" label="rel" onChange={onChange} />);
    await userEvent.click(screen.getByText('Clear'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('filters the page list by the search query', async () => {
    render(<RelationCell value="" label="rel" onChange={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('rel'));
    expect(screen.getByRole('option', { name: 'Roadmap' })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Search pages to link in rel'), 'road');
    expect(screen.getByRole('option', { name: 'Roadmap' })).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText('Search pages to link in rel'));
    await userEvent.type(screen.getByLabelText('Search pages to link in rel'), 'zzz');
    expect(screen.queryByRole('option', { name: 'Roadmap' })).not.toBeInTheDocument();
  });
});
