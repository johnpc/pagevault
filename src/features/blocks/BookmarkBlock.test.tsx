import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookmarkBlock } from './BookmarkBlock';
import type { BlockRecord } from '../../lib/pbClient';

const mk = (content: string): BlockRecord =>
  ({ id: 'b1', type: 'bookmark', content }) as unknown as BlockRecord;

describe('BookmarkBlock', () => {
  it('shows a URL input when empty and saves a normalized URL', async () => {
    const onEdit = vi.fn();
    render(<BookmarkBlock block={mk('')} onEdit={onEdit} />);
    const input = screen.getByLabelText('Bookmark URL');
    await userEvent.type(input, 'notion.so');
    await userEvent.tab();
    expect(onEdit).toHaveBeenCalledWith('b1', { content: 'https://notion.so' });
  });

  it('renders a link card with domain + full URL for a saved bookmark', () => {
    render(<BookmarkBlock block={mk('https://www.notion.so/x')} onEdit={vi.fn()} />);
    expect(screen.getByText('notion.so')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://www.notion.so/x');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('re-opens the editor from the card', async () => {
    render(<BookmarkBlock block={mk('https://a.dev')} onEdit={vi.fn()} />);
    expect(screen.queryByLabelText('Bookmark URL')).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Edit bookmark'));
    expect(screen.getByLabelText('Bookmark URL')).toBeInTheDocument();
  });
});
