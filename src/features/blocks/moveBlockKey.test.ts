import { describe, it, expect, vi } from 'vitest';
import { moveBlockDir, handleMoveBlockKey } from './moveBlockKey';

const key = (over: Record<string, unknown>) => ({
  key: 'ArrowUp',
  shiftKey: true,
  metaKey: true,
  ctrlKey: false,
  preventDefault: vi.fn(),
  ...over,
});

describe('moveBlockDir', () => {
  it('detects Cmd/Ctrl+Shift+Arrow up/down', () => {
    expect(moveBlockDir(key({ key: 'ArrowUp' }) as never)).toBe('up');
    expect(moveBlockDir(key({ key: 'ArrowDown' }) as never)).toBe('down');
    expect(moveBlockDir(key({ key: 'ArrowDown', metaKey: false, ctrlKey: true }) as never)).toBe(
      'down',
    );
  });
  it('is null without the modifier or shift, or for other keys', () => {
    expect(moveBlockDir(key({ shiftKey: false }) as never)).toBeNull();
    expect(moveBlockDir(key({ metaKey: false }) as never)).toBeNull();
    expect(moveBlockDir(key({ key: 'ArrowLeft' }) as never)).toBeNull();
  });
});

describe('handleMoveBlockKey', () => {
  // A fake textarea whose enclosing row reports data-block-index = idx.
  const el = (idx: number) =>
    ({ closest: () => ({ getAttribute: () => String(idx) }) }) as unknown as HTMLTextAreaElement;
  const ids = ['a', 'b', 'c'];

  it('moves the block up: swaps with the previous id', () => {
    const move = vi.fn();
    const e = key({ key: 'ArrowUp' });
    expect(handleMoveBlockKey(e as never, el(1), ids, move)).toBe(true);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(move).toHaveBeenCalledWith('b', 'a');
  });

  it('moves the block down: swaps with the next id', () => {
    const move = vi.fn();
    handleMoveBlockKey(key({ key: 'ArrowDown' }) as never, el(1), ids, move);
    expect(move).toHaveBeenCalledWith('b', 'c');
  });

  it('is handled (returns true) but no-ops at the top/bottom edges', () => {
    const move = vi.fn();
    expect(handleMoveBlockKey(key({ key: 'ArrowUp' }) as never, el(0), ids, move)).toBe(true);
    expect(handleMoveBlockKey(key({ key: 'ArrowDown' }) as never, el(2), ids, move)).toBe(true);
    expect(move).not.toHaveBeenCalled();
  });

  it('returns false when the keypress is not the move chord', () => {
    const move = vi.fn();
    expect(handleMoveBlockKey(key({ shiftKey: false }) as never, el(1), ids, move)).toBe(false);
    expect(move).not.toHaveBeenCalled();
  });

  it('returns false when no move callback is provided', () => {
    expect(handleMoveBlockKey(key({}) as never, el(1), ids, undefined)).toBe(false);
  });
});
