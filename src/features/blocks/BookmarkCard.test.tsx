import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { BookmarkCard } from './BookmarkCard';

const send = vi.fn();
vi.mock('../../lib/pbClient', () => ({ pb: { send: (...a: unknown[]) => send(...a) } }));

const renderCard = (ui: ReactElement) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};

describe('BookmarkCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the domain as a fallback title before/without a preview', () => {
    send.mockReturnValue(Promise.resolve(null));
    renderCard(<BookmarkCard href="https://www.example.com/a" />);
    // With no preview, both the title and the site line fall back to the domain.
    expect(document.querySelector('.pv-bookmark-title')?.textContent).toBe('example.com');
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://www.example.com/a');
  });

  it('renders the scraped title, description and thumbnail when available', async () => {
    send.mockReturnValue(
      Promise.resolve({
        title: 'Cool Article',
        description: 'A great read',
        image: 'https://img.example.com/x.png',
        favicon: 'https://example.com/favicon.ico',
        url: 'https://example.com',
      }),
    );
    renderCard(<BookmarkCard href="https://example.com" />);
    await waitFor(() => expect(screen.getByText('Cool Article')).toBeInTheDocument());
    expect(screen.getByText('A great read')).toBeInTheDocument();
    const thumb = document.querySelector('.pv-bookmark-thumb') as HTMLImageElement;
    expect(thumb?.src).toBe('https://img.example.com/x.png');
  });

  it('requests the preview for the given url', () => {
    send.mockReturnValue(Promise.resolve(null));
    renderCard(<BookmarkCard href="https://example.com/p?q=1" />);
    expect(send).toHaveBeenCalledWith(
      `/api/link-preview?url=${encodeURIComponent('https://example.com/p?q=1')}`,
      { method: 'GET' },
    );
  });
});
