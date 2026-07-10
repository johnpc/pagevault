import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { SidebarRow } from './SidebarRow';
import type { PageNode } from './pageTree';
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

const node: PageNode = {
  page: mk('parent', { title: 'Parent' }),
  children: [{ page: mk('child', { title: 'Child' }), children: [] }],
};

describe('SidebarRow', () => {
  it('renders the row and nested children, and navigates on click', async () => {
    let location = '';
    render(
      <MemoryRouter initialEntries={['/']}>
        <SidebarRow node={node} depth={0} activeId="parent" />
        <Route
          path="*"
          render={({ location: loc }) => {
            location = loc.pathname;
            return null;
          }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Child'));
    expect(location).toBe('/page/child');
  });

  it('falls back to a default icon and Untitled', () => {
    render(
      <MemoryRouter>
        <SidebarRow node={{ page: mk('x', { title: '' }), children: [] }} depth={0} />
      </MemoryRouter>,
    );
    expect(screen.getByText('📄')).toBeInTheDocument();
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });
});
