import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { PageRecord } from '../../lib/pbClient';

const mutate = vi.fn();
vi.mock('./reorderPagesApi', () => ({ useReorderPages: () => ({ mutate }) }));

import { usePageDnd } from './usePageDnd';

const p = (id: string, sort: number, parent = ''): PageRecord =>
  ({ id, sort, parent, title: id }) as unknown as PageRecord;

describe('usePageDnd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tracks dragging + over state and persists a sibling reorder on drop', () => {
    const pages = [p('a', 0), p('b', 1), p('c', 2)];
    const { result } = renderHook(() => usePageDnd(pages));

    act(() => result.current.onDragStart('c'));
    expect(result.current.draggingId).toBe('c');
    act(() => result.current.onDragOver('a'));
    expect(result.current.overId).toBe('a');

    act(() => result.current.onDrop('a'));
    expect(mutate).toHaveBeenCalledWith([
      { id: 'c', sort: 0 },
      { id: 'a', sort: 1 },
      { id: 'b', sort: 2 },
    ]);
    // State resets after the drop.
    expect(result.current.draggingId).toBeNull();
    expect(result.current.overId).toBeNull();
  });

  it('does not mutate when dropping onto itself', () => {
    const { result } = renderHook(() => usePageDnd([p('a', 0), p('b', 1)]));
    act(() => result.current.onDragStart('a'));
    act(() => result.current.onDrop('a'));
    expect(mutate).not.toHaveBeenCalled();
  });

  it('does not mutate a cross-parent drop', () => {
    const { result } = renderHook(() => usePageDnd([p('a', 0, 'x'), p('b', 0, 'y')]));
    act(() => result.current.onDragStart('a'));
    act(() => result.current.onDrop('b'));
    expect(mutate).not.toHaveBeenCalled();
  });

  it('onDragEnd clears state', () => {
    const { result } = renderHook(() => usePageDnd([p('a', 0)]));
    act(() => result.current.onDragStart('a'));
    act(() => result.current.onDragEnd());
    expect(result.current.draggingId).toBeNull();
  });
});
