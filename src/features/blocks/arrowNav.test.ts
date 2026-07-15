import { describe, it, expect } from 'vitest';
import { edgeArrowDir, focusAdjacentBlock, focusPageTitle } from './arrowNav';

const ev = (key: string, mods: Partial<Record<string, boolean>> = {}) => ({
  key,
  shiftKey: false,
  metaKey: false,
  ctrlKey: false,
  altKey: false,
  ...mods,
});

describe('edgeArrowDir', () => {
  it('ArrowUp at the start of the text moves to the previous block', () => {
    expect(edgeArrowDir(ev('ArrowUp'), 'hello', 0, 0)).toBe(-1);
    expect(edgeArrowDir(ev('ArrowLeft'), 'hello', 0, 0)).toBe(-1);
  });

  it('ArrowDown at the end of the text moves to the next block', () => {
    expect(edgeArrowDir(ev('ArrowDown'), 'hello', 5, 5)).toBe(1);
    expect(edgeArrowDir(ev('ArrowRight'), 'hello', 5, 5)).toBe(1);
  });

  it('does not move when the caret is mid-text', () => {
    expect(edgeArrowDir(ev('ArrowUp'), 'hello', 2, 2)).toBeNull();
    expect(edgeArrowDir(ev('ArrowDown'), 'hello', 2, 2)).toBeNull();
  });

  it('ArrowUp at the end (not start) does not move', () => {
    expect(edgeArrowDir(ev('ArrowUp'), 'hello', 5, 5)).toBeNull();
  });

  it('ArrowDown at the start (not end) does not move', () => {
    expect(edgeArrowDir(ev('ArrowDown'), 'hello', 0, 0)).toBeNull();
  });

  it('ignores modified arrows (shift/meta/ctrl/alt) and non-collapsed selections', () => {
    expect(edgeArrowDir(ev('ArrowUp', { shiftKey: true }), 'x', 0, 0)).toBeNull();
    expect(edgeArrowDir(ev('ArrowUp', { metaKey: true }), 'x', 0, 0)).toBeNull();
    expect(edgeArrowDir(ev('ArrowUp', { ctrlKey: true }), 'x', 0, 0)).toBeNull();
    expect(edgeArrowDir(ev('ArrowUp', { altKey: true }), 'x', 0, 0)).toBeNull();
    expect(edgeArrowDir(ev('ArrowUp'), 'hello', 0, 3)).toBeNull();
  });

  it('empty block: caret is both start and end, so either vertical arrow moves', () => {
    expect(edgeArrowDir(ev('ArrowUp'), '', 0, 0)).toBe(-1);
    expect(edgeArrowDir(ev('ArrowDown'), '', 0, 0)).toBe(1);
  });
});

describe('focusAdjacentBlock', () => {
  const build = () => {
    const container = document.createElement('div');
    [0, 1, 2].forEach((i) => {
      const row = document.createElement('div');
      row.setAttribute('data-block-index', String(i));
      const ta = document.createElement('textarea');
      ta.className = 'pv-block-input';
      ta.value = `block ${i}`;
      row.appendChild(ta);
      container.appendChild(row);
    });
    document.body.appendChild(container);
    return container.querySelectorAll('textarea');
  };

  it('moving down (+1) focuses the next block with the caret at the start', () => {
    const [a] = build();
    expect(focusAdjacentBlock(a as HTMLTextAreaElement, 1)).toBe(true);
    const focused = document.activeElement as HTMLTextAreaElement;
    expect(focused.value).toBe('block 1');
    expect(focused.selectionStart).toBe(0);
  });

  it('moving up (-1) focuses the previous block with the caret at the end', () => {
    const tas = build();
    const third = tas[2] as HTMLTextAreaElement;
    expect(focusAdjacentBlock(third, -1)).toBe(true);
    const focused = document.activeElement as HTMLTextAreaElement;
    expect(focused.value).toBe('block 1');
    expect(focused.selectionStart).toBe('block 1'.length);
  });

  it('returns false at the edges (no block beyond the ends)', () => {
    const tas = build();
    expect(focusAdjacentBlock(tas[0] as HTMLTextAreaElement, -1)).toBe(false);
    expect(focusAdjacentBlock(tas[2] as HTMLTextAreaElement, 1)).toBe(false);
  });

  it('returns false when the textarea is not inside a block row', () => {
    const orphan = document.createElement('textarea');
    document.body.appendChild(orphan);
    expect(focusAdjacentBlock(orphan, 1)).toBe(false);
  });

  it('focusPageTitle returns false when there is no title in the DOM', () => {
    document.body.innerHTML = '';
    expect(focusPageTitle()).toBe(false);
  });

  it('moving up (-1) from the first block focuses the page title if present', () => {
    const title = document.createElement('input');
    title.className = 'pv-page-title';
    title.value = 'My page';
    document.body.appendChild(title);
    const tas = build();
    expect(focusAdjacentBlock(tas[0] as HTMLTextAreaElement, -1)).toBe(true);
    const focused = document.activeElement as HTMLInputElement;
    expect(focused.className).toBe('pv-page-title');
    expect(focused.selectionStart).toBe('My page'.length);
    title.remove();
  });
});
