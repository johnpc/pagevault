import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { useAutoFocus } from './useAutoFocus';

describe('useAutoFocus', () => {
  const mkRef = () => {
    const el = document.createElement('textarea');
    el.value = 'Hello';
    document.body.appendChild(el);
    const ref = createRef<HTMLTextAreaElement>();
    (ref as { current: HTMLTextAreaElement }).current = el;
    return { el, ref };
  };

  it('focuses the element and fires onDone when active', () => {
    const { el, ref } = mkRef();
    const onDone = vi.fn();
    renderHook(() => useAutoFocus(true, ref, onDone));
    expect(document.activeElement).toBe(el);
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('places the caret at the given offset (the merge join)', () => {
    const { el, ref } = mkRef();
    renderHook(() => useAutoFocus(true, ref, undefined, 2));
    expect(el.selectionStart).toBe(2);
    expect(el.selectionEnd).toBe(2);
  });

  it('does nothing when inactive', () => {
    const { el, ref } = mkRef();
    el.blur();
    renderHook(() => useAutoFocus(false, ref));
    expect(document.activeElement).not.toBe(el);
  });
});
