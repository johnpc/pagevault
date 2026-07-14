import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColumnDnd } from './useColumnDnd';
import type { TableData } from '../../lib/pbTypes';

const grid: TableData = {
  columns: [
    { name: 'A', type: 'text' },
    { name: 'B', type: 'text' },
  ],
  rows: [['1', '2']],
};

describe('useColumnDnd', () => {
  it('commits a move on drop over a different column', () => {
    const save = vi.fn();
    const { result } = renderHook(() => useColumnDnd(grid, save));
    act(() => result.current.handleProps(0).onDragStart());
    expect(result.current.dragCol).toBe(0);
    const e = { preventDefault: vi.fn() } as unknown as React.DragEvent;
    act(() => result.current.cellProps(1).onDrop(e));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: [
          { name: 'B', type: 'text' },
          { name: 'A', type: 'text' },
        ],
      }),
    );
    expect(result.current.dragCol).toBeNull();
  });

  it('does not save when dropping on the same column', () => {
    const save = vi.fn();
    const { result } = renderHook(() => useColumnDnd(grid, save));
    act(() => result.current.handleProps(1).onDragStart());
    const e = { preventDefault: vi.fn() } as unknown as React.DragEvent;
    act(() => result.current.cellProps(1).onDrop(e));
    expect(save).not.toHaveBeenCalled();
  });

  it('dragEnd clears the drag state', () => {
    const { result } = renderHook(() => useColumnDnd(grid, vi.fn()));
    act(() => result.current.handleProps(0).onDragStart());
    act(() => result.current.handleProps(0).onDragEnd());
    expect(result.current.dragCol).toBeNull();
  });

  it('touch: a pointerdown on the grip then release over another column moves it', () => {
    // The pointer path resolves the target column via data-drag-id under the
    // release point; stub elementFromPoint to "over column 1".
    const th = document.createElement('th');
    th.setAttribute('data-drag-id', '1');
    document.body.appendChild(th);
    document.elementFromPoint = (() => th) as typeof document.elementFromPoint;

    const save = vi.fn();
    const { result } = renderHook(() => useColumnDnd(grid, save));
    const down = new Event('pointerdown', { bubbles: true }) as Event & { pointerType: string };
    down.pointerType = 'touch';
    const grip = document.createElement('button');
    document.body.appendChild(grip);
    grip.addEventListener('pointerdown', (e) =>
      result.current.handleProps(0).onPointerDown(e as unknown as React.PointerEvent),
    );
    act(() => {
      grip.dispatchEvent(down);
    });
    const up = new Event('pointerup', { bubbles: true }) as Event & {
      clientX: number;
      clientY: number;
    };
    up.clientX = 1;
    up.clientY = 1;
    act(() => {
      document.dispatchEvent(up);
    });
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: [
          { name: 'B', type: 'text' },
          { name: 'A', type: 'text' },
        ],
      }),
    );
  });
});

afterEach(() => {
  document.body.innerHTML = '';
});
