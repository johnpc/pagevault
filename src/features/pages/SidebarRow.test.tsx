import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { SidebarRow } from './SidebarRow';
import { sidebarRowEqual, type SidebarRowProps } from './sidebarRowEqual';
import type { PageNode } from './pageTree';
import type { PageDndHandlers } from './usePageDnd';
import type { PageRecord } from '../../lib/pbClient';

const noop = () => {};

const noopHandlers: PageDndHandlers = {
  onDragStart: () => {},
  onDragOver: () => {},
  onDrop: () => {},
  onDragEnd: () => {},
  onPointerDown: () => () => {},
};

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

const renderRow = (
  n: PageNode,
  collapsed = new Set<string>(),
  onToggle = vi.fn(),
  handlers: PageDndHandlers = noopHandlers,
  onAddChild = vi.fn(),
) => {
  let location = '';
  render(
    <MemoryRouter initialEntries={['/']}>
      <SidebarRow
        node={n}
        depth={0}
        activeId="parent"
        collapsed={collapsed}
        onToggle={onToggle}
        onAddChild={onAddChild}
        handlers={handlers}
        draggingId={null}
        overId={null}
      />
      <Route
        path="*"
        render={({ location: loc }) => {
          location = loc.pathname;
          return null;
        }}
      />
    </MemoryRouter>,
  );
  return () => location;
};

describe('SidebarRow', () => {
  it('renders the row and nested children, and navigates on click', async () => {
    const getLocation = renderRow(node);
    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Child'));
    expect(getLocation()).toBe('/page/child');
  });

  it('hides children when the node is collapsed', () => {
    renderRow(node, new Set(['parent']));
    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });

  it('toggles collapse via the disclosure caret', async () => {
    const onToggle = vi.fn();
    renderRow(node, new Set(), onToggle);
    await userEvent.click(screen.getByRole('button', { name: 'Collapse' }));
    expect(onToggle).toHaveBeenCalledWith('parent');
  });

  it('falls back to a default icon and Untitled', () => {
    renderRow({ page: mk('x', { title: '' }), children: [] });
    expect(screen.getByText('📄')).toBeInTheDocument();
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('adds a sub-page via the row "+" button', async () => {
    const onAddChild = vi.fn();
    renderRow(node, new Set(), vi.fn(), noopHandlers, onAddChild);
    await userEvent.click(screen.getByLabelText('Add a sub-page in Parent'));
    expect(onAddChild).toHaveBeenCalledWith('parent');
  });

  it('wires drag reordering: grip starts the drag, the row is the drop target', () => {
    const handlers: PageDndHandlers = {
      onDragStart: vi.fn(),
      onDragOver: vi.fn(),
      onDrop: vi.fn(),
      onDragEnd: vi.fn(),
      onPointerDown: vi.fn(() => vi.fn()),
    };
    renderRow({ page: mk('solo', { title: 'Solo' }), children: [] }, new Set(), vi.fn(), handlers);
    const grip = screen.getByRole('button', { name: /Drag Solo/ });
    // Native drag starts from the grip; the row is the drop target.
    fireEvent.dragStart(grip);
    expect(handlers.onDragStart).toHaveBeenCalledWith('solo');
    fireEvent.pointerDown(grip);
    expect(handlers.onPointerDown).toHaveBeenCalledWith('solo');
    const row = grip.closest('.pv-sidebar-row')!;
    fireEvent.dragOver(row);
    expect(handlers.onDragOver).toHaveBeenCalledWith('solo');
    fireEvent.drop(row);
    expect(handlers.onDrop).toHaveBeenCalledWith('solo');
    fireEvent.dragEnd(row);
    expect(handlers.onDragEnd).toHaveBeenCalled();
  });
});

describe('sidebarRowEqual (memo comparator)', () => {
  const base = (): SidebarRowProps => ({
    node: { page: mk('a', { title: 'A' }), children: [] },
    depth: 0,
    activeId: undefined,
    collapsed: new Set<string>(),
    onToggle: noop,
    onAddChild: noop,
    handlers: noopHandlers,
    draggingId: null,
    overId: null,
  });

  it('skips re-render when drag state changes for OTHER rows', () => {
    // draggingId/overId point at a different row ("b") → this row ("a") is equal.
    const a = base();
    expect(sidebarRowEqual(a, { ...a, draggingId: 'b', overId: 'b' })).toBe(true);
  });

  it('re-renders when THIS row becomes the dragged row', () => {
    const a = base();
    expect(sidebarRowEqual(a, { ...a, draggingId: 'a' })).toBe(false);
  });

  it('re-renders when THIS row becomes the drop-hover target', () => {
    const a = base();
    expect(sidebarRowEqual(a, { ...a, draggingId: 'b', overId: 'a' })).toBe(false);
  });

  it('re-renders when a non-drag prop changes (active, depth, collapsed, onAddChild)', () => {
    const a = base();
    expect(sidebarRowEqual(a, { ...a, activeId: 'a' })).toBe(false);
    expect(sidebarRowEqual(a, { ...a, depth: 1 })).toBe(false);
    expect(sidebarRowEqual(a, { ...a, collapsed: new Set(['a']) })).toBe(false);
    expect(sidebarRowEqual(a, { ...a, onAddChild: () => {} })).toBe(false);
  });
});
