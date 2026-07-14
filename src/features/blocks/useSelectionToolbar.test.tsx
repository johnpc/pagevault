import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createRef } from 'react';
import { useSelectionToolbar } from './useSelectionToolbar';

// A fake textarea with a controllable selection + bounding rect.
function fakeTextarea(value: string, start: number, end: number) {
  const el = {
    value,
    selectionStart: start,
    selectionEnd: end,
    focus: vi.fn(),
    setSelectionRange: vi.fn((s: number, e: number) => {
      el.selectionStart = s;
      el.selectionEnd = e;
    }),
    getBoundingClientRect: () => ({ top: 100, left: 20, width: 300 }),
  };
  return el as unknown as HTMLTextAreaElement;
}

describe('useSelectionToolbar', () => {
  it('anchors above the textarea when there is a selection, hides otherwise', () => {
    const ref = createRef<HTMLTextAreaElement>();
    (ref as { current: HTMLTextAreaElement }).current = fakeTextarea('hello world', 0, 5);
    const { result } = renderHook(() => useSelectionToolbar(ref, 'hello world', vi.fn(), false));

    act(() => result.current.sync());
    expect(result.current.anchor).toEqual({ top: 100, left: 170 }); // left + width/2

    (ref.current as HTMLTextAreaElement).selectionEnd = 0; // collapse
    act(() => result.current.sync());
    expect(result.current.anchor).toBeNull();
  });

  it('does not anchor in a code block', () => {
    const ref = createRef<HTMLTextAreaElement>();
    (ref as { current: HTMLTextAreaElement }).current = fakeTextarea('x = 1', 0, 5);
    const { result } = renderHook(() => useSelectionToolbar(ref, 'x = 1', vi.fn(), true));
    act(() => result.current.sync());
    expect(result.current.anchor).toBeNull();
  });

  it('apply(marker) wraps the selection and writes the new value', () => {
    const ref = createRef<HTMLTextAreaElement>();
    (ref as { current: HTMLTextAreaElement }).current = fakeTextarea('hi there', 3, 8); // "there"
    const setValue = vi.fn();
    const { result } = renderHook(() => useSelectionToolbar(ref, 'hi there', setValue, false));
    act(() => result.current.apply('**'));
    expect(setValue).toHaveBeenCalledWith('hi **there**');
  });

  it('hide() clears the anchor', () => {
    const ref = createRef<HTMLTextAreaElement>();
    (ref as { current: HTMLTextAreaElement }).current = fakeTextarea('abc', 0, 3);
    const { result } = renderHook(() => useSelectionToolbar(ref, 'abc', vi.fn(), false));
    act(() => result.current.sync());
    expect(result.current.anchor).not.toBeNull();
    act(() => result.current.hide());
    expect(result.current.anchor).toBeNull();
  });
});
