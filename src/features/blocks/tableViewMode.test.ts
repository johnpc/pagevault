import { describe, it, expect } from 'vitest';
import { persistedView } from './tableViewMode';

describe('persistedView', () => {
  it('keeps board, gallery and calendar (non-default modes)', () => {
    expect(persistedView('board')).toBe('board');
    expect(persistedView('gallery')).toBe('gallery');
    expect(persistedView('calendar')).toBe('calendar');
  });

  it('drops the default table mode and undefined to undefined', () => {
    expect(persistedView('table')).toBeUndefined();
    expect(persistedView(undefined)).toBeUndefined();
  });
});
