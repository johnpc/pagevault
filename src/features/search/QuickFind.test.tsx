import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route } from 'react-router-dom';
import type { SearchResult } from './searchResults';

const results = vi.fn<[], SearchResult[]>(() => []);
vi.mock('./searchApi', () => ({
  useSearch: (q: string) => ({
    data: q.trim() ? results() : [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

import { QuickFind } from './QuickFind';

const renderQF = (onClose = vi.fn()) => {
  let path = '/';
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/']}>
        <QuickFind onClose={onClose} />
        <Route
          path="*"
          render={({ location }) => {
            path = location.pathname;
            return null;
          }}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { onClose, getPath: () => path };
};

describe('QuickFind', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an empty state when a query has no matches', async () => {
    results.mockReturnValue([]);
    renderQF();
    await userEvent.type(screen.getByLabelText('Search pages'), 'zzz');
    await waitFor(() => expect(screen.getByText('No matches')).toBeInTheDocument());
  });

  it('lists results and navigates to a page on click', async () => {
    results.mockReturnValue([
      { pageId: 'p1', title: 'Roadmap', icon: '🚀', snippet: '', kind: 'title' },
      { pageId: 'p2', title: 'Meeting', icon: '📄', snippet: '…roadmap…', kind: 'block' },
    ]);
    const { onClose, getPath } = renderQF();
    await userEvent.type(screen.getByLabelText('Search pages'), 'road');
    await waitFor(() => expect(screen.getByText('Roadmap')).toBeInTheDocument());
    expect(screen.getByText('…roadmap…')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Meeting'));
    expect(onClose).toHaveBeenCalled();
    expect(getPath()).toBe('/page/p2');
  });

  it('navigates results with arrow keys and opens with Enter', async () => {
    results.mockReturnValue([
      { pageId: 'p1', title: 'Roadmap', icon: '🚀', snippet: '', kind: 'title' },
      { pageId: 'p2', title: 'Meeting', icon: '📄', snippet: '', kind: 'block' },
    ]);
    const { getPath } = renderQF();
    const input = screen.getByLabelText('Search pages');
    await userEvent.type(input, 'road');
    await waitFor(() => expect(screen.getByText('Roadmap')).toBeInTheDocument());
    // First result is active by default; ArrowDown → second, Enter opens it.
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(getPath()).toBe('/page/p2');
  });

  it('closes when the backdrop is clicked', async () => {
    const { onClose } = renderQF();
    await userEvent.click(screen.getByRole('dialog', { name: 'Quick find' }).parentElement!);
    expect(onClose).toHaveBeenCalled();
  });
});
