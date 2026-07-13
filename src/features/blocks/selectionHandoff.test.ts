import { describe, it, expect } from 'vitest';
import { selectionHandoffDir, handoffSelection } from './selectionHandoff';

const key = (k: string, shift = true) => ({ key: k, shiftKey: shift });

describe('selectionHandoffDir', () => {
  it('hands off down only when the caret is at the end', () => {
    expect(selectionHandoffDir(key('ArrowDown'), 'hello', 5, 5)).toBe(1);
    expect(selectionHandoffDir(key('ArrowDown'), 'hello', 2, 2)).toBeNull();
  });
  it('hands off up only when the caret is at the start', () => {
    expect(selectionHandoffDir(key('ArrowUp'), 'hello', 0, 0)).toBe(-1);
    expect(selectionHandoffDir(key('ArrowUp'), 'hello', 3, 3)).toBeNull();
  });
  it('never hands off without shift', () => {
    expect(selectionHandoffDir(key('ArrowDown', false), 'hi', 2, 2)).toBeNull();
  });
  it('never hands off with a non-collapsed in-field selection', () => {
    expect(selectionHandoffDir(key('ArrowDown'), 'hello', 0, 5)).toBeNull();
  });
  it('ignores non-arrow keys', () => {
    expect(selectionHandoffDir(key('a'), '', 0, 0)).toBeNull();
  });
});

describe('handoffSelection', () => {
  /** A textarea whose caret is at `caret`, wrapped in a row at `index`. */
  const makeEl = (value: string, caret: number, index: number): HTMLTextAreaElement => {
    const ta = document.createElement('textarea');
    ta.value = value;
    Object.defineProperty(ta, 'selectionStart', { value: caret });
    Object.defineProperty(ta, 'selectionEnd', { value: caret });
    if (index >= 0) {
      const row = document.createElement('div');
      row.setAttribute('data-block-index', String(index));
      row.appendChild(ta);
    }
    return ta;
  };

  it('returns the anchored range at a caret edge', () => {
    expect(handoffSelection(key('ArrowDown'), makeEl('hi', 2, 1), 4)).toEqual({
      anchor: 1,
      focus: 2,
    });
    expect(handoffSelection(key('ArrowUp'), makeEl('hi', 0, 3), 4)).toEqual({
      anchor: 3,
      focus: 2,
    });
  });

  it('clamps the focus to the list bounds', () => {
    expect(handoffSelection(key('ArrowUp'), makeEl('', 0, 0), 4)).toEqual({ anchor: 0, focus: 0 });
  });

  it('returns null when not at a caret edge', () => {
    expect(handoffSelection(key('ArrowDown'), makeEl('hello', 1, 0), 4)).toBeNull();
  });

  it('returns null when the textarea is not inside a block row', () => {
    expect(handoffSelection(key('ArrowDown'), makeEl('hi', 2, -1), 4)).toBeNull();
  });
});
