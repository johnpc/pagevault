import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route } from 'react-router-dom';
import { fakeCollection, type FakeRecord } from '../../test/pbMock';

const cols: Record<string, ReturnType<typeof fakeCollection>> = {
  pages: fakeCollection(),
  blocks: fakeCollection(),
};

vi.mock('../../lib/pbClient', () => ({
  pb: { collection: (name: string) => cols[name] },
  currentUserId: () => 'u1',
}));
vi.mock('../auth/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'me@x.z' }, signOut: vi.fn() }),
}));

// Import after mocks so the components pick up the fakes.
import { Sidebar } from './Sidebar';
import { PageEditor } from './PageEditor';

const seed = (pages: FakeRecord[], blocks: FakeRecord[] = []) => {
  cols.pages = fakeCollection(pages);
  cols.blocks = fakeCollection(blocks);
};

const renderAt = (ui: React.ReactNode, path = '/') =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );

describe('workspace integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sidebar shows the empty state, then creates a page', async () => {
    seed([]);
    renderAt(<Sidebar onSearch={() => {}} onHelp={() => {}} />);
    await waitFor(() => expect(screen.getByText('No pages yet')).toBeInTheDocument());
    await userEvent.click(screen.getByText('+ New page'));
    await waitFor(() => expect(cols.pages.create).toHaveBeenCalled());
  });

  it('sidebar lists seeded pages by title', async () => {
    seed([
      { id: 'p1', title: 'Roadmap', icon: '🚀', parent: '', sort: 0, archived: false, owner: 'u1' },
    ]);
    renderAt(<Sidebar onSearch={() => {}} onHelp={() => {}} />);
    await waitFor(() => expect(screen.getByText('Roadmap')).toBeInTheDocument());
  });

  it('page editor renders a seeded page and its blocks, and adds a block', async () => {
    seed(
      [{ id: 'p1', title: 'Notes', icon: '📄', parent: '', sort: 0, archived: false, owner: 'u1' }],
      [
        {
          id: 'b1',
          page: 'p1',
          type: 'text',
          content: 'First line',
          checked: false,
          sort: 0,
          owner: 'u1',
        },
      ],
    );
    renderAt(<Route path="/page/:id" component={PageEditor} />, '/page/p1');
    // Real seeded content rendered (honest e2e: assert on data, not just URL).
    await waitFor(() => expect(screen.getByDisplayValue('First line')).toBeInTheDocument());
    expect(screen.getByDisplayValue('Notes')).toBeInTheDocument();
    await userEvent.click(screen.getByText('+ Add a block'));
    await waitFor(() => expect(cols.blocks.create).toHaveBeenCalled());
  });
});
