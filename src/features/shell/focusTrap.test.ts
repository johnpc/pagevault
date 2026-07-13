import { describe, it, expect } from 'vitest';
import { focusables, nextFocus } from './focusTrap';

/** Build a container with the given inner HTML, attached to the document. */
const root = (html: string): HTMLElement => {
  const el = document.createElement('div');
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
};

describe('focusables', () => {
  it('returns focusable elements in DOM order, skipping disabled + tabindex -1', () => {
    const el = root(`
      <button>a</button>
      <button disabled>skip</button>
      <a href="#">b</a>
      <span tabindex="-1">skip</span>
      <input />
    `);
    expect(focusables(el).map((n) => n.textContent || n.tagName)).toEqual(['a', 'b', 'INPUT']);
  });

  it('is empty for a null root', () => {
    expect(focusables(null)).toEqual([]);
  });
});

describe('nextFocus', () => {
  const list = [document.createElement('button'), document.createElement('button')];

  it('advances forward and wraps at the end', () => {
    expect(nextFocus(list, list[0], false)).toBe(list[1]);
    expect(nextFocus(list, list[1], false)).toBe(list[0]);
  });

  it('goes backward and wraps at the start on shift', () => {
    expect(nextFocus(list, list[1], true)).toBe(list[0]);
    expect(nextFocus(list, list[0], true)).toBe(list[1]);
  });

  it('starts at the first (forward) or last (shift) when focus is outside', () => {
    expect(nextFocus(list, null, false)).toBe(list[0]);
    expect(nextFocus(list, null, true)).toBe(list[1]);
  });

  it('returns null for an empty list', () => {
    expect(nextFocus([], null, false)).toBeNull();
  });
});
