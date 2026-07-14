import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLatestRef } from './useLatestRef';

describe('useLatestRef', () => {
  it('returns a stable ref object across renders', () => {
    const { result, rerender } = renderHook(({ v }) => useLatestRef(v), {
      initialProps: { v: 1 },
    });
    const first = result.current;
    rerender({ v: 2 });
    expect(result.current).toBe(first); // same ref identity
  });

  it('always exposes the latest value', () => {
    const { result, rerender } = renderHook(({ v }) => useLatestRef(v), {
      initialProps: { v: 'a' },
    });
    expect(result.current.current).toBe('a');
    rerender({ v: 'b' });
    expect(result.current.current).toBe('b');
  });
});
