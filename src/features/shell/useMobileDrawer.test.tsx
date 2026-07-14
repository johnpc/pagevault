import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, useHistory } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useMobileDrawer } from './useMobileDrawer';

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/a']}>{children}</MemoryRouter>
);

// Drives both the drawer and a history push from one render, so a test can
// navigate and observe the auto-close.
function useDrawerWithNav(enabled: boolean) {
  const drawer = useMobileDrawer(enabled);
  const history = useHistory();
  return { drawer, history };
}

describe('useMobileDrawer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('starts closed and opens/closes via setOpen', () => {
    const { result } = renderHook(() => useMobileDrawer(true), { wrapper });
    expect(result.current.open).toBe(false);
    act(() => result.current.setOpen(true));
    expect(result.current.open).toBe(true);
  });

  it('auto-closes when the route changes', () => {
    const { result } = renderHook(() => useDrawerWithNav(true), { wrapper });
    act(() => result.current.drawer.setOpen(true));
    expect(result.current.drawer.open).toBe(true);
    act(() => result.current.history.push('/b'));
    expect(result.current.drawer.open).toBe(false);
  });

  it('Escape closes the open drawer', () => {
    const { result } = renderHook(() => useMobileDrawer(true), { wrapper });
    act(() => result.current.setOpen(true));
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(result.current.open).toBe(false);
  });

  it('force-closes when disabled (viewport widened to desktop)', () => {
    const { result, rerender } = renderHook(({ e }) => useMobileDrawer(e), {
      wrapper,
      initialProps: { e: true },
    });
    act(() => result.current.setOpen(true));
    expect(result.current.open).toBe(true);
    rerender({ e: false });
    expect(result.current.open).toBe(false);
  });
});
