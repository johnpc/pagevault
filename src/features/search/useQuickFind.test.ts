import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuickFind } from './useQuickFind';

const press = (key: string, mods: Partial<KeyboardEventInit> = {}) =>
  window.dispatchEvent(new KeyboardEvent('keydown', { key, ...mods }));

describe('useQuickFind', () => {
  it('opens and closes on Cmd/Ctrl-K', () => {
    const { result } = renderHook(() => useQuickFind());
    expect(result.current.open).toBe(false);
    act(() => press('k', { metaKey: true }));
    expect(result.current.open).toBe(true);
    act(() => press('k', { ctrlKey: true }));
    expect(result.current.open).toBe(false);
  });

  it('closes on Escape', () => {
    const { result } = renderHook(() => useQuickFind());
    act(() => result.current.setOpen(true));
    act(() => press('Escape'));
    expect(result.current.open).toBe(false);
  });

  it('ignores a plain k without a modifier', () => {
    const { result } = renderHook(() => useQuickFind());
    act(() => press('k'));
    expect(result.current.open).toBe(false);
  });
});
