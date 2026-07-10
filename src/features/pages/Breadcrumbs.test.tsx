import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import type { PageRecord } from '../../lib/pbClient';

const mk = (id: string, over: Partial<PageRecord> = {}): PageRecord =>
  ({
    id,
    title: id,
    icon: '',
    archived: false,
    sort: 0,
    parent: '',
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'pages',
    ...over,
  }) as PageRecord;

const pages = [mk('a', { title: 'Root' }), mk('b', { title: 'Child', parent: 'a' })];
vi.mock('./pagesApi', () => ({ usePages: () => ({ data: pages }) }));

import { Breadcrumbs } from './Breadcrumbs';

const renderAt = (pageId: string) => {
  let path = '';
  render(
    <MemoryRouter initialEntries={[`/page/${pageId}`]}>
      <Breadcrumbs pageId={pageId} />
      <Route
        path="*"
        render={({ location }) => {
          path = location.pathname;
          return null;
        }}
      />
    </MemoryRouter>,
  );
  return () => path;
};

describe('Breadcrumbs', () => {
  it('renders nothing for a top-level page', () => {
    const { container } = render(
      <MemoryRouter>
        <Breadcrumbs pageId="a" />
      </MemoryRouter>,
    );
    expect(container.querySelector('.pv-crumbs')).toBeNull();
  });

  it('shows the ancestor trail and navigates to an ancestor', async () => {
    const getPath = renderAt('b');
    expect(screen.getByText(/Root/)).toBeInTheDocument();
    expect(screen.getByText(/Child/)).toBeInTheDocument();
    await userEvent.click(screen.getByText(/Root/));
    expect(getPath()).toBe('/page/a');
  });

  it('disables the current (last) crumb', () => {
    renderAt('b');
    expect(screen.getByRole('button', { name: /Child/ })).toBeDisabled();
  });
});
