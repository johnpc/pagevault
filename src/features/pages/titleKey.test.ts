import { describe, it, expect } from 'vitest';
import { titleKeyLeaves } from './titleKey';

describe('titleKeyLeaves', () => {
  it('leaves on Enter regardless of caret position', () => {
    expect(titleKeyLeaves('Enter', false)).toBe(true);
    expect(titleKeyLeaves('Enter', true)).toBe(true);
  });

  it('leaves on ArrowDown only at the end of the title', () => {
    expect(titleKeyLeaves('ArrowDown', true)).toBe(true);
    expect(titleKeyLeaves('ArrowDown', false)).toBe(false);
  });

  it('ignores other keys', () => {
    expect(titleKeyLeaves('ArrowUp', true)).toBe(false);
    expect(titleKeyLeaves('a', true)).toBe(false);
  });
});
