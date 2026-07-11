import { describe, it, expect } from 'vitest';
import { TEMPLATES, findTemplate } from './templates';

describe('templates', () => {
  it('includes blank, meeting, and todo templates', () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual(['blank', 'meeting', 'todo']);
  });

  it('findTemplate returns a template by id, or null', () => {
    expect(findTemplate('meeting')?.title).toBe('Meeting notes');
    expect(findTemplate('nope')).toBeNull();
  });

  it('every template has at least one block', () => {
    for (const t of TEMPLATES) expect(t.blocks.length).toBeGreaterThan(0);
  });

  it('the meeting template has an agenda and action items', () => {
    const meeting = findTemplate('meeting');
    expect(meeting?.blocks.some((b) => b.content === 'Agenda')).toBe(true);
    expect(meeting?.blocks.some((b) => b.type === 'todo')).toBe(true);
  });
});
