import { describe, it, expect } from 'vitest';
import { completedMarkerAt } from './inputRule';

describe('completedMarkerAt', () => {
  it('detects a bold marker completed at the caret', () => {
    expect(completedMarkerAt('**bold**', 8)).toEqual({
      start: 0,
      end: 8,
      marker: '**',
      inner: 'bold',
    });
  });

  it('detects each single- and double-char marker', () => {
    expect(completedMarkerAt('a *i*', 5)?.marker).toBe('*');
    expect(completedMarkerAt('`code`', 6)?.marker).toBe('`');
    expect(completedMarkerAt('~~s~~', 5)?.marker).toBe('~~');
    expect(completedMarkerAt('__u__', 5)?.marker).toBe('__');
  });

  it('reports the marker range and inner text mid-string', () => {
    // "hi **b**" — caret after the closing **.
    expect(completedMarkerAt('hi **b**', 8)).toEqual({
      start: 3,
      end: 8,
      marker: '**',
      inner: 'b',
    });
  });

  it('prefers the double-char marker over the single (greedy)', () => {
    expect(completedMarkerAt('**x**', 5)?.marker).toBe('**');
  });

  it('returns null when no marker is completed at the caret', () => {
    expect(completedMarkerAt('**x', 3)).toBeNull(); // not closed
    expect(completedMarkerAt('plain text', 10)).toBeNull();
    expect(completedMarkerAt('**bold**', 4)).toBeNull(); // caret mid-marker
  });

  it('rejects an empty or whitespace-only inner (no bolding nothing)', () => {
    expect(completedMarkerAt('****', 4)).toBeNull();
    expect(completedMarkerAt('** **', 5)).toBeNull();
  });
});
