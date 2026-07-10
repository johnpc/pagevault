import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

const pages = { getFullList: vi.fn().mockResolvedValue([]), create: vi.fn() };
vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => pages },
  currentUserId: () => 'u1',
}));

import { HomeScreen } from './HomeScreen';

describe('HomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('greets the user and creates a first page on CTA', async () => {
    pages.create.mockResolvedValue({ id: 'p1' });
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <HomeScreen />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText('Welcome to PageVault')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Create a page'));
    await waitFor(() =>
      expect(pages.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Getting started', owner: 'u1' }),
      ),
    );
  });
});
