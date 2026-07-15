import { describe, it, expect } from 'vitest';
import { selectionKeyAction } from './selectionKeyAction';

const ev = (
  key: string,
  mods: Partial<{ metaKey: boolean; ctrlKey: boolean; shiftKey: boolean }> = {},
) => ({
  key,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  ...mods,
});

describe('selectionKeyAction', () => {
  it('maps Cmd/Ctrl+A to selectAll', () => {
    expect(selectionKeyAction(ev('a', { metaKey: true }))).toEqual({ kind: 'selectAll' });
    expect(selectionKeyAction(ev('A', { ctrlKey: true }))).toEqual({ kind: 'selectAll' });
  });

  it('maps Cmd/Ctrl+D to duplicate', () => {
    expect(selectionKeyAction(ev('d', { ctrlKey: true }))).toEqual({ kind: 'duplicate' });
  });

  it('maps Tab / Shift+Tab to indent in / out', () => {
    expect(selectionKeyAction(ev('Tab'))).toEqual({ kind: 'indent', dir: 'in' });
    expect(selectionKeyAction(ev('Tab', { shiftKey: true }))).toEqual({
      kind: 'indent',
      dir: 'out',
    });
  });

  it('maps arrows to move (Shift grows)', () => {
    expect(selectionKeyAction(ev('ArrowDown'))).toEqual({ kind: 'move', delta: 1, grow: false });
    expect(selectionKeyAction(ev('ArrowUp', { shiftKey: true }))).toEqual({
      kind: 'move',
      delta: -1,
      grow: true,
    });
  });

  it('maps Backspace/Delete to delete and Escape to clear', () => {
    expect(selectionKeyAction(ev('Backspace'))).toEqual({ kind: 'delete' });
    expect(selectionKeyAction(ev('Delete'))).toEqual({ kind: 'delete' });
    expect(selectionKeyAction(ev('Escape'))).toEqual({ kind: 'clear' });
  });

  it('returns null for an unhandled key, and for a plain letter without a modifier', () => {
    expect(selectionKeyAction(ev('x'))).toBeNull();
    expect(selectionKeyAction(ev('a'))).toBeNull();
    expect(selectionKeyAction(ev('d'))).toBeNull();
  });
});
