import { describe, it, expect } from 'vitest';
import { dragIdAtPoint } from './dragPoint';

describe('dragIdAtPoint', () => {
  const row = (id: string) => {
    const div = document.createElement('div');
    div.setAttribute('data-drag-id', id);
    const inner = document.createElement('span');
    div.appendChild(inner);
    return { div, inner };
  };

  it('returns the drag id of the row under the point', () => {
    const { div } = row('blk1');
    expect(dragIdAtPoint(5, 5, () => div)).toBe('blk1');
  });

  it('walks up from a nested element to the enclosing draggable row', () => {
    const { inner } = row('blk2');
    expect(dragIdAtPoint(5, 5, () => inner)).toBe('blk2');
  });

  it('returns null when the point is over nothing', () => {
    expect(dragIdAtPoint(5, 5, () => null)).toBeNull();
  });

  it('returns null when the element has no draggable ancestor', () => {
    const orphan = document.createElement('div');
    expect(dragIdAtPoint(5, 5, () => orphan)).toBeNull();
  });
});
