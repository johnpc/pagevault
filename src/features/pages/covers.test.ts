import { describe, it, expect } from 'vitest';
import { COVERS, coverGradient } from './covers';

describe('coverGradient', () => {
  it('returns the gradient for a known cover id', () => {
    expect(coverGradient('ocean')).toContain('linear-gradient');
    expect(coverGradient('ocean')).toBe(COVERS.find((c) => c.id === 'ocean')?.gradient);
  });
  it('returns null for an empty or unknown id', () => {
    expect(coverGradient('')).toBeNull();
    expect(coverGradient('nope')).toBeNull();
  });
  it('every cover has a linear-gradient value', () => {
    for (const c of COVERS) expect(c.gradient).toMatch(/^linear-gradient/);
  });
});
