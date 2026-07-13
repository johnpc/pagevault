import { describe, it, expect } from 'vitest';
import { persistedView } from './tableViewMode';

describe('persistedView', () => {
  it('keeps board and gallery (non-default modes)', () => {
    expect(persistedView('board')).toBe('board');
    expect(persistedView('gallery')).toBe('gallery');
  });

  it('drops the default table mode and undefined to undefined', () => {
    expect(persistedView('table')).toBeUndefined();
    expect(persistedView(undefined)).toBeUndefined();
  });
});
