import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBlockPaste } from './useBlockPaste';

// A minimal ClipboardEvent stand-in: clipboard text + a textarea with a selection.
const evt = (text: string, value: string, start: number, end: number) => {
  const setSelectionRange = vi.fn();
  const preventDefault = vi.fn();
  return {
    e: {
      clipboardData: { getData: () => text },
      currentTarget: { selectionStart: start, selectionEnd: end, setSelectionRange },
      preventDefault,
    },
    setSelectionRange,
    preventDefault,
  };
};

describe('useBlockPaste', () => {
  it('wraps a selection as a link when a URL is pasted over it', () => {
    const setValue = vi.fn();
    const onPasteMarkdown = vi.fn();
    const { result } = renderHook(() =>
      useBlockPaste(false, 'see the docs now', setValue, onPasteMarkdown),
    );
    const { e, preventDefault } = evt('https://ex.com', 'see the docs now', 4, 12);
    result.current(e as never);
    expect(preventDefault).toHaveBeenCalled();
    expect(setValue).toHaveBeenCalledWith('see [the docs](https://ex.com) now');
    expect(onPasteMarkdown).not.toHaveBeenCalled();
  });

  it('imports markdown when pasted into an empty block', () => {
    const setValue = vi.fn();
    const onPasteMarkdown = vi.fn();
    const { result } = renderHook(() => useBlockPaste(false, '', setValue, onPasteMarkdown));
    const { e } = evt('# Heading\nbody', '', 0, 0);
    result.current(e as never);
    expect(onPasteMarkdown).toHaveBeenCalledWith('# Heading\nbody');
  });

  it('does not linkify inside a code block', () => {
    const setValue = vi.fn();
    const { result } = renderHook(() => useBlockPaste(true, 'x = 1', setValue, vi.fn()));
    const { e, preventDefault } = evt('https://ex.com', 'x = 1', 0, 5);
    result.current(e as never);
    expect(preventDefault).not.toHaveBeenCalled(); // browser pastes normally
    expect(setValue).not.toHaveBeenCalled();
  });

  it('leaves an ordinary paste to the browser (no selection, plain text)', () => {
    const setValue = vi.fn();
    const onPasteMarkdown = vi.fn();
    const { result } = renderHook(() => useBlockPaste(false, 'hello', setValue, onPasteMarkdown));
    const { e, preventDefault } = evt('world', 'hello', 5, 5);
    result.current(e as never);
    expect(preventDefault).not.toHaveBeenCalled();
    expect(setValue).not.toHaveBeenCalled();
    expect(onPasteMarkdown).not.toHaveBeenCalled();
  });
});
