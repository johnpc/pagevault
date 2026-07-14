import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounced } from './useDebounced';

describe('useDebounced', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounced('a', 200));
    expect(result.current).toBe('a');
  });

  it('only updates after the value stops changing for the delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounced(v, 200), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'ab' });
    rerender({ v: 'abc' });
    // Still the old value until the timer fires.
    expect(result.current).toBe('a');
    act(() => void vi.advanceTimersByTime(200));
    expect(result.current).toBe('abc');
  });

  it('resets the timer on each change (coalesces rapid input)', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounced(v, 200), {
      initialProps: { v: 'a' },
    });
    rerender({ v: 'ab' });
    act(() => void vi.advanceTimersByTime(150)); // not yet
    rerender({ v: 'abc' });
    act(() => void vi.advanceTimersByTime(150)); // 150 since last change → still waiting
    expect(result.current).toBe('a');
    act(() => void vi.advanceTimersByTime(50)); // now 200 since last change
    expect(result.current).toBe('abc');
  });
});
