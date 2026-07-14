import { describe, it, expect } from 'vitest';
import { SHORTCUTS, isTypingTarget } from './shortcuts';

describe('SHORTCUTS', () => {
  it('documents quick find and the help key', () => {
    expect(SHORTCUTS.some((s) => /⌘K/.test(s.keys))).toBe(true);
    expect(SHORTCUTS.some((s) => s.keys === '?')).toBe(true);
  });
  it('documents the selection formatting shortcuts (incl. underline & strikethrough)', () => {
    const fmt = SHORTCUTS.find((s) => /underline/i.test(s.action));
    expect(fmt).toBeDefined();
    expect(fmt?.action).toMatch(/strikethrough/i);
  });
  it('every entry has keys and an action', () => {
    for (const s of SHORTCUTS) {
      expect(s.keys.length).toBeGreaterThan(0);
      expect(s.action.length).toBeGreaterThan(0);
    }
  });
});

describe('isTypingTarget', () => {
  it('is true for input and textarea', () => {
    expect(isTypingTarget(document.createElement('input'))).toBe(true);
    expect(isTypingTarget(document.createElement('textarea'))).toBe(true);
  });
  it('is false for a plain element and for null', () => {
    expect(isTypingTarget(document.createElement('div'))).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});
