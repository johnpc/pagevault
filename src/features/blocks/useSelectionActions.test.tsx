import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSelectionActions } from './useSelectionActions';

describe('useSelectionActions', () => {
  it('colors the chosen ids then clears the selection', () => {
    const clear = vi.fn();
    const onColorMany = vi.fn();
    const { result } = renderHook(() =>
      useSelectionActions(['a', 'b'], clear, { onColorMany, onDeleteMany: vi.fn() }),
    );
    result.current.colorSelected('blue');
    expect(onColorMany).toHaveBeenCalledWith(['a', 'b'], 'blue');
    expect(clear).toHaveBeenCalled();
  });

  it('deletes the chosen ids then clears', () => {
    const clear = vi.fn();
    const onDeleteMany = vi.fn();
    const { result } = renderHook(() => useSelectionActions(['x'], clear, { onDeleteMany }));
    result.current.deleteSelected();
    expect(onDeleteMany).toHaveBeenCalledWith(['x']);
    expect(clear).toHaveBeenCalled();
  });

  it('duplicates the chosen ids then clears', () => {
    const clear = vi.fn();
    const onDuplicateMany = vi.fn();
    const { result } = renderHook(() =>
      useSelectionActions(['a', 'b'], clear, { onDeleteMany: vi.fn(), onDuplicateMany }),
    );
    result.current.duplicateSelected();
    expect(onDuplicateMany).toHaveBeenCalledWith(['a', 'b']);
    expect(clear).toHaveBeenCalled();
  });

  it('turns the chosen ids into a type then clears', () => {
    const clear = vi.fn();
    const onTypeMany = vi.fn();
    const { result } = renderHook(() =>
      useSelectionActions(['a', 'b'], clear, { onDeleteMany: vi.fn(), onTypeMany }),
    );
    result.current.turnIntoSelected('heading');
    expect(onTypeMany).toHaveBeenCalledWith(['a', 'b'], 'heading');
    expect(clear).toHaveBeenCalled();
  });

  it('still clears (no-op) when nothing is selected', () => {
    const clear = vi.fn();
    const onColorMany = vi.fn();
    const { result } = renderHook(() =>
      useSelectionActions([], clear, { onColorMany, onDeleteMany: vi.fn() }),
    );
    result.current.colorSelected('red');
    expect(onColorMany).not.toHaveBeenCalled();
    expect(clear).toHaveBeenCalled();
  });

  it('tolerates a missing onColorMany / onDuplicateMany', () => {
    const clear = vi.fn();
    const { result } = renderHook(() =>
      useSelectionActions(['a'], clear, { onDeleteMany: vi.fn() }),
    );
    expect(() => result.current.colorSelected('red')).not.toThrow();
    expect(() => result.current.duplicateSelected()).not.toThrow();
    expect(() => result.current.turnIntoSelected('quote')).not.toThrow();
    expect(clear).toHaveBeenCalled();
  });
});
