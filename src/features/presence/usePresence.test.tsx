import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { PresenceContext, type PresenceState } from './PresenceContext';
import { usePresenceViewers, useBlockCursors, useSetFocusedBlock } from './usePresence';

const wrap = (state: PresenceState) => {
  return ({ children }: { children: ReactNode }) => (
    <PresenceContext.Provider value={state}>{children}</PresenceContext.Provider>
  );
};

const state: PresenceState = {
  viewers: [{ id: 'u1', label: 'Ada', initial: 'A' }],
  cursors: { b1: [{ id: 'u1', label: 'Ada', initial: 'A', block: 'b1' }] },
  setFocusedBlock: vi.fn(),
};

describe('presence consumer hooks', () => {
  it('usePresenceViewers returns the shared viewer list', () => {
    const { result } = renderHook(() => usePresenceViewers(), { wrapper: wrap(state) });
    expect(result.current).toHaveLength(1);
  });

  it('useBlockCursors returns cursors for a block, [] when none', () => {
    const { result } = renderHook(() => useBlockCursors('b1'), { wrapper: wrap(state) });
    expect(result.current[0].label).toBe('Ada');
    const empty = renderHook(() => useBlockCursors('bX'), { wrapper: wrap(state) });
    expect(empty.result.current).toEqual([]);
  });

  it('useSetFocusedBlock returns the provider setter', () => {
    const { result } = renderHook(() => useSetFocusedBlock(), { wrapper: wrap(state) });
    result.current('b2');
    expect(state.setFocusedBlock).toHaveBeenCalledWith('b2');
  });
});
