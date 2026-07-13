import { describe, it, expect } from 'vitest';
import { makeShareToken, shareUrl, inviteUrl } from './sharing';

describe('makeShareToken', () => {
  it('produces a slug of the requested length from the alphabet', () => {
    // Deterministic rand: always 0 → first char 'a'.
    expect(makeShareToken(5, () => 0)).toBe('aaaaa');
  });
  it('uses the full alphabet range', () => {
    // rand just below 1 → last char '9'.
    expect(makeShareToken(3, () => 0.999)).toBe('999');
  });
  it('defaults to a 16-char token', () => {
    expect(makeShareToken()).toHaveLength(16);
  });
});

describe('shareUrl', () => {
  it('builds a /shared/<token> URL and trims a trailing slash', () => {
    expect(shareUrl('https://pv.example.com/', 'tok')).toBe('https://pv.example.com/shared/tok');
    expect(shareUrl('http://localhost:5173', 'abc')).toBe('http://localhost:5173/shared/abc');
  });
});

describe('inviteUrl', () => {
  it('builds a /join/<token> URL and trims a trailing slash', () => {
    expect(inviteUrl('https://pv.example.com/', 'tok')).toBe('https://pv.example.com/join/tok');
    expect(inviteUrl('http://localhost:5173', 'abc')).toBe('http://localhost:5173/join/abc');
  });
});
