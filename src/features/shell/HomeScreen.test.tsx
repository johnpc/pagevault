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
    <QueryClientProvider client={new QueryClient()}>
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

  it('greets the user and creates a first page on CTA', async () => {
    pages.create.mockResolvedValue({ id: 'p1' });
    renderHome();
    expect(screen.getByText('Welcome to PageVault')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Create a page'));
    await waitFor(() =>
      expect(pages.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Getting started', owner: 'u1' }),
      ),
    );
  });

  it('shows recently edited pages and navigates to one on click', async () => {
    pages.getFullList.mockResolvedValue([
      { id: 'p1', title: 'Older', icon: '📄', archived: false, updated: '2026-01-01T00:00:00Z' },
      { id: 'p2', title: 'Newer', icon: '🚀', archived: false, updated: '2026-03-01T00:00:00Z' },
    ]);
    const getPath = renderHome();
    await waitFor(() => expect(screen.getByText('Recently edited')).toBeInTheDocument());
    // Newest first.
    const cards = screen.getAllByText(/Older|Newer/);
    expect(cards[0]).toHaveTextContent('Newer');
    await userEvent.click(screen.getByText('Newer'));
    expect(getPath()).toBe('/page/p2');
  });
});
