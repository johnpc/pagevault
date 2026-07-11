import { describe, it, expect, vi } from 'vitest';
import { render as rtlRender, screen, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { MediaBlockRow } from './MediaBlockRow';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';

vi.mock('./blocksApi', () => ({ useBlocks: () => ({ data: [] }) }));

const render = (ui: ReactElement): RenderResult =>
  rtlRender(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );

const mk = (type: BlockType): BlockRecord =>
  ({ id: 'b1', page: 'p1', type, content: '', data: null }) as unknown as BlockRecord;

const renderType = (type: BlockType) =>
  render(
    <MediaBlockRow
      block={mk(type)}
      cls="pv-block"
      style={{ marginLeft: '0px' }}
      rowDrag={{}}
      handle={<span>handle</span>}
      onEdit={vi.fn()}
      onRemove={vi.fn()}
      onDuplicate={vi.fn()}
      onUpload={vi.fn()}
    />,
  );

describe('MediaBlockRow', () => {
  it('renders a divider with a rule + delete control', () => {
    const { container } = renderType('divider');
    expect(container.querySelector('hr')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete block')).toBeInTheDocument();
  });

  it('renders an image block editor', () => {
    renderType('image');
    expect(screen.getByLabelText('Upload image file')).toBeInTheDocument();
  });

  it('renders a table block', () => {
    renderType('table');
    expect(screen.getByLabelText('Column 1 name')).toBeInTheDocument();
  });

  it('renders a columns layout', () => {
    renderType('columns');
    expect(screen.getByLabelText('Column 1')).toBeInTheDocument();
  });

  it('renders a table of contents', () => {
    renderType('toc');
    expect(screen.getByText(/Add headings/)).toBeInTheDocument();
  });

  it('returns null for a text block (BlockRow renders the body)', () => {
    const { container } = renderType('text');
    expect(container).toBeEmptyDOMElement();
  });
});
