import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';

const pageState = {
  data: undefined as PageRecord | undefined,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
};
const blockState = {
  data: [] as BlockRecord[],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
};
vi.mock('./sharingApi', () => ({
  usePublicPage: () => pageState,
  usePublicBlocks: () => blockState,
}));

import { SharedPage } from './SharedPage';

const page = (over: Partial<PageRecord> = {}): PageRecord =>
  ({
    id: 'p1',
    title: 'Public doc',
    icon: '🌍',
    cover: '',
    isPublic: true,
    shareToken: 'tok',
    owner: 'u1',
    ...over,
  }) as PageRecord;
const blk = (content: string, type = 'text'): BlockRecord =>
  ({
    id: content,
    page: 'p1',
    type,
    content,
    checked: false,
    sort: 0,
    owner: 'u1',
  }) as unknown as BlockRecord;

const renderShared = () =>
  render(
    <MemoryRouter initialEntries={['/shared/tok']}>
      <Route path="/shared/:token" component={SharedPage} />
    </MemoryRouter>,
  );

describe('SharedPage', () => {
  beforeEach(() => {
    pageState.data = undefined;
    blockState.data = [];
  });

  it('renders the shared page title and its blocks read-only', () => {
    pageState.data = page();
    blockState.data = [blk('Hello **world**'), blk('a note', 'quote')];
    renderShared();
    expect(screen.getByText(/Public doc/)).toBeInTheDocument();
    expect(screen.getByText('world').tagName).toBe('STRONG');
    // No editing affordances on the public view.
    expect(screen.queryByLabelText('Block content')).not.toBeInTheDocument();
    expect(screen.getByText('Shared with PageVault')).toBeInTheDocument();
  });

  it('shows an empty state when the token resolves to nothing', () => {
    pageState.data = undefined;
    renderShared();
    expect(screen.getByText('This page isn’t shared')).toBeInTheDocument();
  });
});
