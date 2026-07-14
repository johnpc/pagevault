import { describe, it, expect, vi } from 'vitest';
import type { KeyboardEvent } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useBlockSelection } from './useBlockSelection';

const ids = ['a', 'b', 'c', 'd'];

/** The selection actions bag; pass a delete/indent spy to assert on it. */
const actions = (onDeleteMany = vi.fn(), onIndentMany = vi.fn()) => ({
  onDeleteMany,
  onIndentMany,
});

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
const docKey = (key: string, shiftKey = false, metaKey = false) =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, shiftKey, metaKey, cancelable: true }),
  );

describe('useBlockSelection', () => {
  it('starts inactive', () => {
    const { result } = renderHook(() => useBlockSelection(ids, actions()));
    expect(result.current.active).toBe(false);
  });

  it('hands off from a textarea Shift+Down at the caret end', () => {
    const { result } = renderHook(() => useBlockSelection(ids, actions()));
    act(() => result.current.onKeyDown(textareaKey('ArrowDown', 'hi', 2, 1)));
    expect(result.current.active).toBe(true);
    expect(result.current.selectedAt(1)).toBe(true);
    expect(result.current.selectedAt(2)).toBe(true);
    expect(result.current.selectedAt(0)).toBe(false);
  });

  it('extends and collapses with arrows once active', () => {
    const { result } = renderHook(() => useBlockSelection(ids, actions()));
    act(() => result.current.onKeyDown(textareaKey('ArrowDown', '', 0, 0))); // select 0..1
    act(() => docKey('ArrowDown', true)); // extend to 0..2
    expect(result.current.selectedAt(2)).toBe(true);
    act(() => docKey('ArrowUp', false)); // collapse
    expect(result.current.selectedAt(0)).toBe(false);
  });

  it('deletes the selected range on Backspace and clears', () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useBlockSelection(ids, actions(onDelete)));
    act(() => result.current.onKeyDown(textareaKey('ArrowDown', '', 0, 0))); // 0..1
    act(() => docKey('Backspace'));
    expect(onDelete).toHaveBeenCalledWith(['a', 'b']);
    expect(result.current.active).toBe(false);
  });

  it('clears on Escape', () => {
    const { result } = renderHook(() => useBlockSelection(ids, actions()));
    act(() => result.current.onKeyDown(textareaKey('ArrowDown', '', 0, 0)));
    act(() => docKey('Escape'));
    expect(result.current.active).toBe(false);
  });

  it('shift-clicks to select the range from the focused block to the clicked one', () => {
    const { result } = renderHook(() => useBlockSelection(ids, actions()));
    act(() => result.current.noteFocus(0));
    act(() => result.current.shiftClick(2));
    expect(result.current.active).toBe(true);
    expect(result.current.selectedAt(0)).toBe(true);
    expect(result.current.selectedAt(2)).toBe(true);
    expect(result.current.selectedAt(3)).toBe(false);
  });

  it('shift-click extends an existing selection, then Backspace deletes the range', () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useBlockSelection(ids, actions(onDelete)));
    act(() => result.current.noteFocus(1));
    act(() => result.current.shiftClick(2)); // 1..2
    act(() => result.current.shiftClick(3)); // extend to 1..3
    act(() => docKey('Backspace'));
    expect(onDelete).toHaveBeenCalledWith(['b', 'c', 'd']);
  });

  it('Cmd/Ctrl+A in a fully-selected field selects every block', () => {
    const { result } = renderHook(() => useBlockSelection(ids, actions()));
    // A textarea keydown with the whole value selected → escalate to all blocks.
    const el = document.createElement('textarea');
    el.value = 'hi';
    Object.defineProperty(el, 'selectionStart', { value: 0 });
    Object.defineProperty(el, 'selectionEnd', { value: 2 });
    const nativeEvent = { stopImmediatePropagation: vi.fn() };
    act(() =>
      result.current.onKeyDown({
        key: 'a',
        metaKey: true,
        ctrlKey: false,
        preventDefault: vi.fn(),
        target: el,
        nativeEvent,
      } as unknown as KE),
    );
    expect(result.current.active).toBe(true);
    expect(result.current.selectedAt(0)).toBe(true);
    expect(result.current.selectedAt(3)).toBe(true);
  });

  it('Cmd/Ctrl+A while already selecting grows to all blocks', () => {
    const { result } = renderHook(() => useBlockSelection(ids, actions()));
    act(() => result.current.noteFocus(1));
    act(() => result.current.shiftClick(2)); // 1..2 active
    act(() => docKey('a', false, true)); // Cmd+A at document level
    expect(result.current.selectedAt(0)).toBe(true);
    expect(result.current.selectedAt(3)).toBe(true);
  });

  it('Tab indents the whole selection; Shift+Tab outdents it', () => {
    const onIndent = vi.fn();
    const { result } = renderHook(() => useBlockSelection(ids, actions(vi.fn(), onIndent)));
    act(() => result.current.noteFocus(1));
    act(() => result.current.shiftClick(2)); // select b..c
    act(() => docKey('Tab'));
    expect(onIndent).toHaveBeenLastCalledWith(['b', 'c'], 'in');
    act(() => docKey('Tab', true)); // Shift+Tab
    expect(onIndent).toHaveBeenLastCalledWith(['b', 'c'], 'out');
  });
});
