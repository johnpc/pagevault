import { describe, it, expect } from 'vitest';
import { TURN_INTO_TYPES, canTurnInto } from './turnInto';

describe('turnInto', () => {
  it('offers only text-body types (no media/divider)', () => {
    const types = TURN_INTO_TYPES.map((c) => c.type);
    expect(types).toContain('text');
    expect(types).toContain('heading');
    expect(types).toContain('quote');
    expect(types).toContain('callout');
    expect(types).not.toContain('image');
    expect(types).not.toContain('table');
    expect(types).not.toContain('divider');
    expect(types).not.toContain('columns');
    expect(types).not.toContain('toc');
  });

  it('canTurnInto is true for text types and false for media/divider', () => {
    expect(canTurnInto('text')).toBe(true);
    expect(canTurnInto('todo')).toBe(true);
    expect(canTurnInto('image')).toBe(false);
    expect(canTurnInto('divider')).toBe(false);
  });

  it('carries a label + icon for each option (reused from the slash catalog)', () => {
    for (const c of TURN_INTO_TYPES) {
      expect(c.label).toBeTruthy();
      expect(c.icon).toBeTruthy();
    }
  });
});
