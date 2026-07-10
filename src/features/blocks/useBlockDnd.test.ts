import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBlockDnd } from './useBlockDnd';

describe('useBlockDnd', () => {
  it('calls onMove with from/to on a drop over another block', () => {
    const onMove = vi.fn();
    const { result } = renderHook(() => useBlockDnd(onMove));
    act(() => result.current.onDragStart('a'));
    act(() => result.current.onDragOver('c'));
    expect(result.current.draggingId).toBe('a');
    expect(result.current.overId).toBe('c');
    act(() => result.current.onDrop('c'));
    expect(onMove).toHaveBeenCalledWith('a', 'c');
    expect(result.current.draggingId).toBeNull();
  });

  it('does not move when dropped on itself', () => {
    const onMove = vi.fn();
    const { result } = renderHook(() => useBlockDnd(onMove));
    act(() => result.current.onDragStart('a'));
    act(() => result.current.onDrop('a'));
    expect(onMove).not.toHaveBeenCalled();
  });

  it('clears state on drag end', () => {
    const { result } = renderHook(() => useBlockDnd(vi.fn()));
    act(() => result.current.onDragStart('a'));
    act(() => result.current.onDragEnd());
    expect(result.current.draggingId).toBeNull();
    expect(result.current.overId).toBeNull();
  });
});
