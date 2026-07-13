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
});
