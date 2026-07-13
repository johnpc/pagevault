import { describe, it, expect } from 'vitest';
import { alignClass, ALIGNMENTS } from './blockAlign';

describe('alignClass', () => {
  it('maps center and right to their modifier classes', () => {
    expect(alignClass('center')).toBe('pv-align--center');
    expect(alignClass('right')).toBe('pv-align--right');
  });

  it('returns no class for the default (left/empty/undefined/unknown)', () => {
    expect(alignClass('')).toBe('');
    expect(alignClass(undefined)).toBe('');
    expect(alignClass('left')).toBe('');
    expect(alignClass('bogus')).toBe('');
  });
});

describe('ALIGNMENTS', () => {
  it('offers left/center/right with the default left first', () => {
    expect(ALIGNMENTS.map((a) => a.token)).toEqual(['', 'center', 'right']);
    expect(ALIGNMENTS[0].label).toBe('Left');
  });
});
