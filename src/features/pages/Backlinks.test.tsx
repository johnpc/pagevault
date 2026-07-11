import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import type { PageRecord } from '../../lib/pbClient';
import type { Backlink } from './backlinkGroups';

let data: Backlink[] | undefined;
vi.mock('./backlinksApi', () => ({ useBacklinks: () => ({ data }) }));

import { Backlinks } from './Backlinks';

const pg = (id: string, title: string): PageRecord =>
  ({ id, title, icon: '📓', archived: false }) as PageRecord;

const renderAt = () => {
  let path = '';
  render(
    <MemoryRouter initialEntries={['/page/target']}>
      <Backlinks pageId="target" />
      <Route path="*" render={({ location }) => ((path = location.pathname), null)} />
    </MemoryRouter>,
  );
  return () => path;
};

describe('Backlinks', () => {
  it('renders nothing when there are no linked references', () => {
    data = [];
    const { container } = render(
      <MemoryRouter>
        <Backlinks pageId="target" />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('lists linking pages with a snippet and navigates on click', async () => {
    data = [{ page: pg('src1', 'Journal'), snippets: ['see @[Roadmap](target) today'] }];
    const getPath = renderAt();
    expect(screen.getByText('Linked references')).toBeInTheDocument();
    expect(screen.getByText('Journal')).toBeInTheDocument();
    // The snippet renders the mention as a link too (via FormattedText).
    await userEvent.click(screen.getByText('Journal'));
    expect(getPath()).toBe('/page/src1');
  });
});
