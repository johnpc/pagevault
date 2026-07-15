import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route } from 'react-router-dom';

const pages = { getFullList: vi.fn().mockResolvedValue([]), create: vi.fn() };
vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => pages },
  currentUserId: () => 'u1',
}));

import { HomeScreen } from './HomeScreen';

const renderHome = () => {
  let path = '';
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <HomeScreen />
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
  return () => path;
};

describe('HomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pages.getFullList.mockResolvedValue([]);
  });

  it('greets the user and creates a page from a template', async () => {
    pages.create.mockResolvedValue({ id: 'p1' });
    const getPath = renderHome();
    expect(screen.getByText('Welcome to PageVault')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Meeting notes'));
    await waitFor(() =>
      expect(pages.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Meeting notes', owner: 'u1' }),
      ),
    );
    await waitFor(() => expect(getPath()).toBe('/page/p1'));
  });

  it('shows recently edited pages and navigates to one on click', async () => {
    pages.getFullList.mockResolvedValue([
      { id: 'p1', title: 'Older', icon: '📄', archived: false, updated: '2026-01-01T00:00:00Z' },
      { id: 'p2', title: 'Newer', icon: '🚀', archived: false, updated: '2026-03-01T00:00:00Z' },
    ]);
    const getPath = renderHome();
    // Wait for the cards to actually render (the heading now shows during the
    // loading state too, so wait on a card, not just the section heading).
    await waitFor(() => expect(screen.getByText('Newer')).toBeInTheDocument());
    // Newest first.
    const cards = screen.getAllByText(/Older|Newer/);
    expect(cards[0]).toHaveTextContent('Newer');
    await userEvent.click(screen.getByText('Newer'));
    expect(getPath()).toBe('/page/p2');
  });

  it('surfaces a retryable error if pages fail to load (welcome stays usable)', async () => {
    pages.getFullList.mockRejectedValue(new Error('network'));
    renderHome();
    // The data-independent welcome + template picker still render…
    expect(screen.getByText('Welcome to PageVault')).toBeInTheDocument();
    expect(screen.getByText('Meeting notes')).toBeInTheDocument();
    // …and the recent section shows a retry instead of silently vanishing.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(pages.getFullList).toHaveBeenCalledTimes(2); // retry re-fetches
  });
});
