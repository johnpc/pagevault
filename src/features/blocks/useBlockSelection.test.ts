import { describe, it, expect, vi } from 'vitest';
import type { KeyboardEvent } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useBlockSelection } from './useBlockSelection';

const ids = ['a', 'b', 'c', 'd'];

type KE = KeyboardEvent;
const preventDefault = vi.fn();

/** A keydown from a textarea with the caret at `caret` in `value` (the handoff
 * event the container's onKeyDown receives). */
const textareaKey = (key: string, value: string, caret: number, index: number): KE => {
  const ta = document.createElement('textarea');
  ta.value = value;
  const wrap = document.createElement('div');
  wrap.setAttribute('data-block-index', String(index));
  wrap.appendChild(ta);
  Object.defineProperty(ta, 'selectionStart', { value: caret });
  Object.defineProperty(ta, 'selectionEnd', { value: caret });
  const nativeEvent = { stopImmediatePropagation: vi.fn() };
  return { key, shiftKey: true, preventDefault, target: ta, nativeEvent } as unknown as KE;
};

/** Dispatch a real document-level keydown (how the active selection is driven
 * once the textarea has blurred). */
const docKey = (key: string, shiftKey = false) =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, cancelable: true }));

describe('useBlockSelection', () => {
  it('starts inactive', () => {
    const { result } = renderHook(() => useBlockSelection(ids, vi.fn()));
    expect(result.current.active).toBe(false);
  });

  it('hands off from a textarea Shift+Down at the caret end', () => {
    const { result } = renderHook(() => useBlockSelection(ids, vi.fn()));
    act(() => result.current.onKeyDown(textareaKey('ArrowDown', 'hi', 2, 1)));
    expect(result.current.active).toBe(true);
    expect(result.current.selectedAt(1)).toBe(true);
    expect(result.current.selectedAt(2)).toBe(true);
    expect(result.current.selectedAt(0)).toBe(false);
  });

  it('extends and collapses with arrows once active', () => {
    const { result } = renderHook(() => useBlockSelection(ids, vi.fn()));
    act(() => result.current.onKeyDown(textareaKey('ArrowDown', '', 0, 0))); // select 0..1
    act(() => docKey('ArrowDown', true)); // extend to 0..2
    expect(result.current.selectedAt(2)).toBe(true);
    act(() => docKey('ArrowUp', false)); // collapse
    expect(result.current.selectedAt(0)).toBe(false);
  });

  it('deletes the selected range on Backspace and clears', () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useBlockSelection(ids, onDelete));
    act(() => result.current.onKeyDown(textareaKey('ArrowDown', '', 0, 0))); // 0..1
    act(() => docKey('Backspace'));
    expect(onDelete).toHaveBeenCalledWith(['a', 'b']);
    expect(result.current.active).toBe(false);
  });

  it('clears on Escape', () => {
    const { result } = renderHook(() => useBlockSelection(ids, vi.fn()));
    act(() => result.current.onKeyDown(textareaKey('ArrowDown', '', 0, 0)));
    act(() => docKey('Escape'));
    expect(result.current.active).toBe(false);
  });
});
