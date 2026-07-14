import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { BookmarkBlock } from './BookmarkBlock';
import type { BlockRecord } from '../../lib/pbClient';

// BookmarkCard fetches a preview via pb.send — stub it so the card falls back to
// the plain domain (a resolved-null keeps these tests about the block, not the
// preview; the fetch itself is covered in linkPreviewApi/BookmarkCard tests).
vi.mock('../../lib/pbClient', () => ({
  pb: { send: () => Promise.resolve(null) },
}));

const mk = (content: string): BlockRecord =>
  ({ id: 'b1', type: 'bookmark', content }) as unknown as BlockRecord;

const renderWithClient = (ui: ReactElement) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};

describe('BookmarkBlock', () => {
  it('shows a URL input when empty and saves a normalized URL', async () => {
    const onEdit = vi.fn();
    renderWithClient(<BookmarkBlock block={mk('')} onEdit={onEdit} />);
    const input = screen.getByLabelText('Bookmark URL');
    await userEvent.type(input, 'notion.so');
    await userEvent.tab();
    expect(onEdit).toHaveBeenCalledWith('b1', { content: 'https://notion.so' });
  });

  it('renders a preview card that opens the URL, with a domain fallback', () => {
    renderWithClient(<BookmarkBlock block={mk('https://www.notion.so/x')} onEdit={vi.fn()} />);
    expect(document.querySelector('.pv-bookmark-title')?.textContent).toBe('notion.so');
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://www.notion.so/x');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('re-opens the editor from the card', async () => {
    renderWithClient(<BookmarkBlock block={mk('https://a.dev')} onEdit={vi.fn()} />);
    expect(screen.queryByLabelText('Bookmark URL')).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Edit bookmark'));
    expect(screen.getByLabelText('Bookmark URL')).toBeInTheDocument();
  });
});
