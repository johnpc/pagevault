import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSelectionActions } from './useSelectionActions';

describe('useSelectionActions', () => {
  it('colors the chosen ids then clears the selection', () => {
    const clear = vi.fn();
    const onColorMany = vi.fn();
    const { result } = renderHook(() =>
      useSelectionActions(['a', 'b'], clear, onColorMany, vi.fn()),
    );
    result.current.colorSelected('blue');
    expect(onColorMany).toHaveBeenCalledWith(['a', 'b'], 'blue');
    expect(clear).toHaveBeenCalled();
  });

  it('deletes the chosen ids then clears', () => {
    const clear = vi.fn();
    const onDeleteMany = vi.fn();
    const { result } = renderHook(() => useSelectionActions(['x'], clear, undefined, onDeleteMany));
    result.current.deleteSelected();
    expect(onDeleteMany).toHaveBeenCalledWith(['x']);
    expect(clear).toHaveBeenCalled();
  });

  it('still clears (no-op) when nothing is selected', () => {
    const clear = vi.fn();
    const onColorMany = vi.fn();
    const { result } = renderHook(() => useSelectionActions([], clear, onColorMany, vi.fn()));
    result.current.colorSelected('red');
    expect(onColorMany).not.toHaveBeenCalled();
    expect(clear).toHaveBeenCalled();
  });

  it('tolerates a missing onColorMany', () => {
    const clear = vi.fn();
    const { result } = renderHook(() => useSelectionActions(['a'], clear, undefined, vi.fn()));
    expect(() => result.current.colorSelected('red')).not.toThrow();
    expect(clear).toHaveBeenCalled();
  });
});
