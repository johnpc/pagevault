import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { SidebarRow } from './SidebarRow';
import type { PageNode } from './pageTree';
import type { PageDndHandlers } from './usePageDnd';
import type { PageRecord } from '../../lib/pbClient';

const noopDnd: PageDndHandlers = {
  draggingId: null,
  overId: null,
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
  dnd: PageDndHandlers = noopDnd,
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
        dnd={dnd}
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

  it('wires drag reordering: grip starts the drag, the row is the drop target', () => {
    const dnd: PageDndHandlers = {
      ...noopDnd,
      onDragStart: vi.fn(),
      onDragOver: vi.fn(),
      onDrop: vi.fn(),
      onDragEnd: vi.fn(),
      onPointerDown: vi.fn(() => vi.fn()),
    };
    renderRow({ page: mk('solo', { title: 'Solo' }), children: [] }, new Set(), vi.fn(), dnd);
    const grip = screen.getByRole('button', { name: /Drag Solo/ });
    // Native drag starts from the grip; the row is the drop target.
    fireEvent.dragStart(grip);
    expect(dnd.onDragStart).toHaveBeenCalledWith('solo');
    fireEvent.pointerDown(grip);
    expect(dnd.onPointerDown).toHaveBeenCalledWith('solo');
    const row = grip.closest('.pv-sidebar-row')!;
    fireEvent.dragOver(row);
    expect(dnd.onDragOver).toHaveBeenCalledWith('solo');
    fireEvent.drop(row);
    expect(dnd.onDrop).toHaveBeenCalledWith('solo');
    fireEvent.dragEnd(row);
    expect(dnd.onDragEnd).toHaveBeenCalled();
  });
});
