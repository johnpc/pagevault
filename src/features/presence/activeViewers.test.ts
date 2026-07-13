import { describe, it, expect } from 'vitest';
import { activeViewers, blockCursors, viewerLabel, ACTIVE_WINDOW_MS } from './activeViewers';
import type { PresenceRecord } from '../../lib/pbClient';

const NOW = 1_000_000_000_000;
const at = (msAgo: number) => new Date(NOW - msAgo).toISOString();

const row = (over: Partial<PresenceRecord> & { user: string }): PresenceRecord =>
  ({
    id: `pr-${over.user}`,
    page: 'pg',
    updated: at(0),
    created: at(0),
    collectionId: 'c',
    collectionName: 'presence',
    ...over,
  }) as PresenceRecord;

describe('viewerLabel', () => {
  it('prefers name, then email local part, then a short id', () => {
    expect(viewerLabel(row({ user: 'u1', expand: { user: { name: 'Ada' } } as never }))).toBe(
      'Ada',
    );
    expect(viewerLabel(row({ user: 'u1', expand: { user: { email: 'ada@x.io' } } as never }))).toBe(
      'ada',
    );
    expect(viewerLabel(row({ user: 'abcdef123456' }))).toBe('abcdef');
  });
});

describe('activeViewers', () => {
  it('excludes the current user', () => {
    const rows = [row({ user: 'me' }), row({ user: 'other' })];
    expect(activeViewers(rows, 'me', NOW).map((v) => v.id)).toEqual(['other']);
  });

  it('drops viewers whose heartbeat is older than the active window', () => {
    const rows = [
      row({ user: 'fresh', updated: at(5_000) }),
      row({ user: 'stale', updated: at(ACTIVE_WINDOW_MS + 1) }),
    ];
    expect(activeViewers(rows, 'me', NOW).map((v) => v.id)).toEqual(['fresh']);
  });

  it('de-dupes a user with multiple rows', () => {
    const rows = [row({ user: 'dup', id: 'a' }), row({ user: 'dup', id: 'b' })];
    expect(activeViewers(rows, 'me', NOW)).toHaveLength(1);
  });

  it('sorts by label and derives an uppercase initial', () => {
    const rows = [
      row({ user: 'u1', expand: { user: { name: 'zoe' } } as never }),
      row({ user: 'u2', expand: { user: { name: 'ada' } } as never }),
    ];
    const v = activeViewers(rows, 'me', NOW);
    expect(v.map((x) => x.label)).toEqual(['ada', 'zoe']);
    expect(v[0].initial).toBe('A');
  });
});

describe('blockCursors', () => {
  it('groups active viewers by their focused block, excluding self + blockless', () => {
    const rows = [
      row({ user: 'u1', block: 'b1', expand: { user: { name: 'Ada' } } as never }),
      row({ user: 'u2', block: 'b1', expand: { user: { name: 'Bo' } } as never }),
      row({ user: 'u3', block: 'b2', expand: { user: { name: 'Cy' } } as never }),
      row({ user: 'u4', block: '' }), // not on a block → absent
      row({ user: 'me', block: 'b1' }), // self → excluded
    ];
    const map = blockCursors(rows, 'me', NOW);
    expect(map.b1.map((v) => v.label)).toEqual(['Ada', 'Bo']);
    expect(map.b2.map((v) => v.label)).toEqual(['Cy']);
    expect(Object.keys(map).sort()).toEqual(['b1', 'b2']);
  });

  it('drops cursors whose heartbeat is stale', () => {
    const rows = [row({ user: 'u1', block: 'b1', updated: at(ACTIVE_WINDOW_MS + 1) })];
    expect(blockCursors(rows, 'me', NOW)).toEqual({});
  });
});
