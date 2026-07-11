import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShortcutHelp } from './useShortcutHelp';

const press = (key: string, target?: EventTarget) => {
  const e = new KeyboardEvent('keydown', { key });
  if (target) Object.defineProperty(e, 'target', { value: target });
  window.dispatchEvent(e);
};

describe('useShortcutHelp', () => {
  it('opens and closes on "?"', () => {
    const { result } = renderHook(() => useShortcutHelp());
    expect(result.current.open).toBe(false);
    act(() => press('?'));
    expect(result.current.open).toBe(true);
    act(() => press('?'));
    expect(result.current.open).toBe(false);
  });

  it('closes on Escape', () => {
    const { result } = renderHook(() => useShortcutHelp());
    act(() => result.current.setOpen(true));
    act(() => press('Escape'));
    expect(result.current.open).toBe(false);
  });

  it('ignores "?" typed into an input field', () => {
    const { result } = renderHook(() => useShortcutHelp());
    act(() => press('?', document.createElement('input')));
    expect(result.current.open).toBe(false);
  });
});
