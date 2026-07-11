import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReconciled } from './useReconciled';

describe('useReconciled', () => {
  it('seeds from the external value', () => {
    const { result } = renderHook(() => useReconciled('hello', false));
    expect(result.current[0]).toBe('hello');
  });

  it('adopts a new external value while unfocused', () => {
    const { result, rerender } = renderHook(({ ext }) => useReconciled(ext, false), {
      initialProps: { ext: 'a' },
    });
    rerender({ ext: 'b' });
    expect(result.current[0]).toBe('b');
  });

  it('does NOT adopt an external change while focused (caret safety)', () => {
    const { result, rerender } = renderHook(({ ext, focused }) => useReconciled(ext, focused), {
      initialProps: { ext: 'a', focused: false },
    });
    act(() => result.current[1]('typing'));
    rerender({ ext: 'remote', focused: true });
    expect(result.current[0]).toBe('typing');
  });

  it('adopts the latest external value once it unfocuses', () => {
    const { result, rerender } = renderHook(({ ext, focused }) => useReconciled(ext, focused), {
      initialProps: { ext: 'a', focused: true },
    });
    rerender({ ext: 'remote', focused: true });
    expect(result.current[0]).toBe('a'); // held while focused
    rerender({ ext: 'remote', focused: false });
    expect(result.current[0]).toBe('remote'); // adopted on blur
  });

  it('keeps local edits when the external value is unchanged', () => {
    const { result, rerender } = renderHook(({ ext }) => useReconciled(ext, false), {
      initialProps: { ext: 'a' },
    });
    act(() => result.current[1]('local'));
    rerender({ ext: 'a' });
    expect(result.current[0]).toBe('local');
  });
});
