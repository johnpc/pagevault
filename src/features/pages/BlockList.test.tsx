import { describe, it, expect, vi } from 'vitest';
import { render as rtlRender, screen, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { BlockList } from './BlockList';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';
import type { BlockDndHandlers } from '../blocks/BlockRow';

// BlockRow's editor uses usePages() (@-mentions) + router Links.
vi.mock('./pagesApi', () => ({ usePages: () => ({ data: [] }) }));

const render = (ui: ReactElement): RenderResult =>
  rtlRender(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );

const noopDnd: BlockDndHandlers = {
  draggingId: null,
  overId: null,
  onDragStart: () => {},
  onDragOver: () => {},
  onDrop: () => {},
  onDragEnd: () => {},
};

const page = { id: 'p1', title: 'P', icon: '' } as unknown as PageRecord;

let n = 0;
const blk = (type: BlockType, depth: number, content: string, collapsed = false): BlockRecord =>
  ({
    id: `b${n++}`,
    page: 'p1',
    type,
    depth,
    content,
    collapsed,
    checked: false,
    sort: n,
  }) as unknown as BlockRecord;

const renderList = (data: BlockRecord[]) =>
  render(
    <BlockList
      page={page}
      blocks={{ data, isLoading: false, isError: false, refetch: () => {} }}
      dnd={noopDnd}
      onEdit={vi.fn()}
      onRemove={vi.fn()}
      onDuplicate={vi.fn()}
      onIndent={vi.fn()}
      onPasteMarkdown={vi.fn()}
      onSplit={vi.fn()}
      onUpload={vi.fn()}
      onAddBlock={vi.fn()}
      onSubPage={vi.fn()}
      focusId={null}
      onFocused={vi.fn()}
    />,
  );

describe('BlockList toggle visibility', () => {
  it('hides the children of a collapsed toggle', () => {
    renderList([
      blk('toggle', 0, 'Summary', true),
      blk('text', 1, 'hidden child'),
      blk('text', 0, 'sibling'),
    ]);
    const values = screen
      .getAllByLabelText('Block content')
      .map((el) => (el as HTMLTextAreaElement).value);
    expect(values).toContain('Summary');
    expect(values).toContain('sibling');
    expect(values).not.toContain('hidden child');
  });

  it('shows the children when the toggle is expanded', () => {
    renderList([blk('toggle', 0, 'Summary', false), blk('text', 1, 'visible child')]);
    const values = screen
      .getAllByLabelText('Block content')
      .map((el) => (el as HTMLTextAreaElement).value);
    expect(values).toContain('visible child');
  });
});
