import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSidebarToggle } from './useSidebarToggle';

const press = (key: string, meta = true) =>
  window.dispatchEvent(new KeyboardEvent('keydown', { key, metaKey: meta, cancelable: true }));

describe('useSidebarToggle', () => {
  it('starts shown', () => {
    const { result } = renderHook(() => useSidebarToggle());
    expect(result.current.hidden).toBe(false);
  });

  it('toggles on Cmd/Ctrl+\\', () => {
    const { result } = renderHook(() => useSidebarToggle());
    act(() => void press('\\'));
    expect(result.current.hidden).toBe(true);
    act(() => void press('\\'));
    expect(result.current.hidden).toBe(false);
  });

  it('ignores \\ without a modifier', () => {
    const { result } = renderHook(() => useSidebarToggle());
    act(() => void press('\\', false));
    expect(result.current.hidden).toBe(false);
  });

  it('exposes a setter for the restore button', () => {
    const { result } = renderHook(() => useSidebarToggle());
    act(() => result.current.setHidden(true));
    expect(result.current.hidden).toBe(true);
  });
});
