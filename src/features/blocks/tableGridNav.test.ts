import { describe, it, expect } from 'vitest';
import { gridNavTarget, cellPosOf, caretEdges } from './tableGridNav';

const k = (key: string, shiftKey = false) => ({ key, shiftKey });
const bounds = { rows: 3, cols: 2 };
const bothEdges = { atStart: true, atEnd: true };

describe('gridNavTarget', () => {
  it('Enter and ArrowDown move one row down', () => {
    expect(gridNavTarget(k('Enter'), { r: 0, c: 1 }, bounds, bothEdges)).toEqual({ r: 1, c: 1 });
    expect(gridNavTarget(k('ArrowDown'), { r: 1, c: 0 }, bounds, bothEdges)).toEqual({
      r: 2,
      c: 0,
    });
  });

  it('Shift+Enter and ArrowUp move one row up', () => {
    expect(gridNavTarget(k('Enter', true), { r: 2, c: 0 }, bounds, bothEdges)).toEqual({
      r: 1,
      c: 0,
    });
    expect(gridNavTarget(k('ArrowUp'), { r: 1, c: 1 }, bounds, bothEdges)).toEqual({ r: 0, c: 1 });
  });

  it('does not move past the last or first row (no wrap)', () => {
    expect(gridNavTarget(k('ArrowDown'), { r: 2, c: 0 }, bounds, bothEdges)).toBeNull();
    expect(gridNavTarget(k('ArrowUp'), { r: 0, c: 0 }, bounds, bothEdges)).toBeNull();
  });

  it('ArrowRight moves a column only at the text end', () => {
    expect(
      gridNavTarget(k('ArrowRight'), { r: 0, c: 0 }, bounds, { atStart: false, atEnd: true }),
    ).toEqual({
      r: 0,
      c: 1,
    });
    // caret mid-text → let the input move the caret, not the cell
    expect(
      gridNavTarget(k('ArrowRight'), { r: 0, c: 0 }, bounds, { atStart: false, atEnd: false }),
    ).toBeNull();
  });

  it('ArrowLeft moves a column only at the text start', () => {
    expect(
      gridNavTarget(k('ArrowLeft'), { r: 0, c: 1 }, bounds, { atStart: true, atEnd: false }),
    ).toEqual({
      r: 0,
      c: 0,
    });
    expect(
      gridNavTarget(k('ArrowLeft'), { r: 0, c: 1 }, bounds, { atStart: false, atEnd: false }),
    ).toBeNull();
  });

  it('does not move past the first or last column', () => {
    expect(gridNavTarget(k('ArrowLeft'), { r: 0, c: 0 }, bounds, bothEdges)).toBeNull();
    expect(gridNavTarget(k('ArrowRight'), { r: 0, c: 1 }, bounds, bothEdges)).toBeNull();
  });

  it('ignores unrelated keys', () => {
    expect(gridNavTarget(k('a'), { r: 0, c: 0 }, bounds, bothEdges)).toBeNull();
    expect(gridNavTarget(k('Escape'), { r: 0, c: 0 }, bounds, bothEdges)).toBeNull();
  });
});

describe('cellPosOf', () => {
  const inTd = (attr: string | null) => {
    const td = document.createElement('td');
    if (attr !== null) td.setAttribute('data-cell', attr);
    const input = document.createElement('input');
    td.appendChild(input);
    return input;
  };

  it('reads the r-c from the enclosing data-cell td', () => {
    expect(cellPosOf(inTd('2-3'))).toEqual({ r: 2, c: 3 });
  });

  it('returns null when there is no data-cell ancestor', () => {
    const orphan = document.createElement('input');
    expect(cellPosOf(orphan)).toBeNull();
  });

  it('returns null for a malformed attribute', () => {
    expect(cellPosOf(inTd('x-y'))).toBeNull();
  });
});

describe('caretEdges', () => {
  it('text input: reports start/end from the caret selection', () => {
    const el = document.createElement('input');
    el.type = 'text';
    el.value = 'abc';
    el.setSelectionRange(0, 0);
    expect(caretEdges(el)).toEqual({ atStart: true, atEnd: false });
    el.setSelectionRange(3, 3);
    expect(caretEdges(el)).toEqual({ atStart: false, atEnd: true });
    el.setSelectionRange(1, 2); // a range → neither edge collapsed
    expect(caretEdges(el)).toEqual({ atStart: false, atEnd: false });
  });

  it('textarea: start/end by caret position', () => {
    const el = document.createElement('textarea');
    el.value = 'hi';
    el.setSelectionRange(2, 2);
    expect(caretEdges(el)).toEqual({ atStart: false, atEnd: true });
  });

  it('non-text controls (select/checkbox) are both edges so arrows navigate', () => {
    expect(caretEdges(document.createElement('select'))).toEqual({ atStart: true, atEnd: true });
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    expect(caretEdges(cb)).toEqual({ atStart: true, atEnd: true });
  });
});
