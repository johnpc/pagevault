import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './useIsMobile';

// A controllable matchMedia mock that records listeners so tests can flip the
// match state and fire a change.
function mockMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  const mql = {
    get matches() {
      return matches;
    },
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  };
  window.matchMedia = (() => mql) as unknown as typeof window.matchMedia;
  return {
    set(v: boolean) {
      matches = v;
      act(() => listeners.forEach((cb) => cb()));
    },
    count: () => listeners.size,
  };
}

describe('useIsMobile', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reflects the initial match state', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes (resize / rotate)', () => {
    const mq = mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    mq.set(true);
    expect(result.current).toBe(true);
  });

  it('unsubscribes on unmount', () => {
    const mq = mockMatchMedia(true);
    const { unmount } = renderHook(() => useIsMobile());
    expect(mq.count()).toBe(1);
    unmount();
    expect(mq.count()).toBe(0);
  });
});
