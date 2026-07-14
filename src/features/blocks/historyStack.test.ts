import { describe, it, expect } from 'vitest';
import { emptyHistory, pushEdit, popUndo, popRedo } from './historyStack';

describe('historyStack', () => {
  it('pushes edits and undoes them last-in-first-out', () => {
    let s = emptyHistory<string>();
    s = pushEdit(s, { payload: 'a' });
    s = pushEdit(s, { payload: 'b' });
    const u1 = popUndo(s)!;
    expect(u1.entry.payload).toBe('b');
    const u2 = popUndo(u1.state)!;
    expect(u2.entry.payload).toBe('a');
    expect(popUndo(u2.state)).toBeNull();
  });

  it('redoes undone edits in order', () => {
    let s = emptyHistory<string>();
    s = pushEdit(s, { payload: 'a' });
    s = pushEdit(s, { payload: 'b' });
    const u = popUndo(s)!; // undo b
    const r = popRedo(u.state)!;
    expect(r.entry.payload).toBe('b');
    expect(popRedo(r.state)).toBeNull();
  });

  it('a new edit clears the redo stack (forks history)', () => {
    let s = emptyHistory<string>();
    s = pushEdit(s, { payload: 'a' });
    const u = popUndo(s)!; // future=[a]
    s = pushEdit(u.state, { payload: 'c' });
    expect(s.future).toEqual([]);
    expect(popRedo(s)).toBeNull();
  });

  it('coalesces consecutive edits with the same key into one undo step', () => {
    let s = emptyHistory<string>();
    // Simulate keystrokes on the same block: the FIRST payload (pre-edit state)
    // must be what survives, so one undo restores the whole run.
    s = pushEdit(s, { coalesceKey: 'b1', payload: 'pre' });
    s = pushEdit(s, { coalesceKey: 'b1', payload: 'mid' });
    s = pushEdit(s, { coalesceKey: 'b1', payload: 'post' });
    expect(s.past).toHaveLength(1);
    // Coalesced entry keeps the key; payload is replaced by the latest.
    expect(s.past[0].payload).toBe('post');
    const u = popUndo(s)!;
    expect(u.entry.payload).toBe('post');
    expect(popUndo(u.state)).toBeNull();
  });

  it('does NOT coalesce across different keys or empty keys', () => {
    let s = emptyHistory<string>();
    s = pushEdit(s, { coalesceKey: 'b1', payload: 'a' });
    s = pushEdit(s, { coalesceKey: 'b2', payload: 'b' });
    s = pushEdit(s, { payload: 'c' }); // no key
    s = pushEdit(s, { payload: 'd' }); // no key — still distinct
    expect(s.past).toHaveLength(4);
  });

  it('caps the stack at `cap`, dropping the oldest', () => {
    let s = emptyHistory<number>();
    for (let i = 0; i < 5; i++) s = pushEdit(s, { payload: i }, 3);
    expect(s.past.map((e) => e.payload)).toEqual([2, 3, 4]);
  });
});
