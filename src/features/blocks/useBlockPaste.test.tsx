import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBlockPaste } from './useBlockPaste';

// A minimal ClipboardEvent stand-in: clipboard text/items + a textarea selection.
const evt = (
  text: string,
  value: string,
  start: number,
  end: number,
  items: DataTransferItem[] = [],
) => {
  const setSelectionRange = vi.fn();
  const preventDefault = vi.fn();
  return {
    e: {
      clipboardData: { getData: () => text, items },
      currentTarget: { selectionStart: start, selectionEnd: end, setSelectionRange },
      preventDefault,
    },
    setSelectionRange,
    preventDefault,
  };
};

const handlers = () => ({
  setValue: vi.fn(),
  onPasteMarkdown: vi.fn(),
  onPasteImage: vi.fn(),
});

describe('useBlockPaste', () => {
  it('wraps a selection as a link when a URL is pasted over it', () => {
    const h = handlers();
    const { result } = renderHook(() => useBlockPaste(false, 'see the docs now', h));
    const { e, preventDefault } = evt('https://ex.com', 'see the docs now', 4, 12);
    result.current(e as never);
    expect(preventDefault).toHaveBeenCalled();
    expect(h.setValue).toHaveBeenCalledWith('see [the docs](https://ex.com) now');
    expect(h.onPasteMarkdown).not.toHaveBeenCalled();
  });

  it('imports markdown when pasted into an empty block', () => {
    const h = handlers();
    const { result } = renderHook(() => useBlockPaste(false, '', h));
    const { e } = evt('# Heading\nbody', '', 0, 0);
    result.current(e as never);
    expect(h.onPasteMarkdown).toHaveBeenCalledWith('# Heading\nbody');
  });

  it('pastes a clipboard image into an empty block as an image block', () => {
    const h = handlers();
    const file = new File(['x'], 'shot.png', { type: 'image/png' });
    const item = { kind: 'file', type: 'image/png', getAsFile: () => file } as DataTransferItem;
    const { result } = renderHook(() => useBlockPaste(false, '', h));
    const { e, preventDefault } = evt('', '', 0, 0, [item]);
    result.current(e as never);
    expect(preventDefault).toHaveBeenCalled();
    expect(h.onPasteImage).toHaveBeenCalledWith(file);
    expect(h.onPasteMarkdown).not.toHaveBeenCalled();
  });

  it('does not linkify inside a code block', () => {
    const h = handlers();
    const { result } = renderHook(() => useBlockPaste(true, 'x = 1', h));
    const { e, preventDefault } = evt('https://ex.com', 'x = 1', 0, 5);
    result.current(e as never);
    expect(preventDefault).not.toHaveBeenCalled(); // browser pastes normally
    expect(h.setValue).not.toHaveBeenCalled();
  });

  it('leaves an ordinary paste to the browser (no selection, plain text)', () => {
    const h = handlers();
    const { result } = renderHook(() => useBlockPaste(false, 'hello', h));
    const { e, preventDefault } = evt('world', 'hello', 5, 5);
    result.current(e as never);
    expect(preventDefault).not.toHaveBeenCalled();
    expect(h.setValue).not.toHaveBeenCalled();
    expect(h.onPasteMarkdown).not.toHaveBeenCalled();
  });
});
