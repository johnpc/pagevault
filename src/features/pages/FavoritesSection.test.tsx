import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { PageRecord } from '../../lib/pbClient';

const toggleMutate = vi.fn();
vi.mock('./pagesApi', () => ({
  useToggleFavorite: () => ({ mutate: toggleMutate }),
}));

import { FavoritesSection } from './FavoritesSection';

const pg = (id: string, title: string, favorite: boolean): PageRecord =>
  ({ id, title, favorite, icon: '', parent: '', owner: 'u1' }) as unknown as PageRecord;

const renderSection = (pages: PageRecord[]) =>
  render(
    <MemoryRouter>
      <FavoritesSection pages={pages} />
    </MemoryRouter>,
  );

describe('FavoritesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when there are no favorites', () => {
    const { container } = renderSection([pg('p1', 'Plain', false)]);
    expect(container).toBeEmptyDOMElement();
  });

  it('lists only favorited pages', () => {
    renderSection([pg('p1', 'Faved', true), pg('p2', 'Not faved', false)]);
    expect(screen.getByText('Faved')).toBeInTheDocument();
    expect(screen.queryByText('Not faved')).not.toBeInTheDocument();
  });

  it('the ★ removes a page from favorites in place', async () => {
    renderSection([pg('p1', 'Faved', true)]);
    await userEvent.click(screen.getByLabelText('Remove Faved from favorites'));
    expect(toggleMutate).toHaveBeenCalledWith({ id: 'p1', favorite: false });
  });
});
