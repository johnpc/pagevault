import { describe, it, expect, vi } from 'vitest';
import { seedWorkspace } from './seedWorkspace';
import { STARTER_PAGES } from './fixtures/starter';

describe('seedWorkspace', () => {
  it('creates every starter page and all its blocks, owner-stamped', async () => {
    const created: Record<string, unknown[]> = { pages: [], blocks: [] };
    let n = 0;
    const pb = {
      collection: (name: string) => ({
        create: vi.fn(async (data: Record<string, unknown>) => {
          const rec = { id: `id${++n}`, ...data };
          created[name].push(rec);
          return rec;
        }),
      }),
    };

    const count = await seedWorkspace(pb as never, 'owner1');

    expect(count).toBe(STARTER_PAGES.length);
    expect(created.pages).toHaveLength(STARTER_PAGES.length);
    const totalBlocks = STARTER_PAGES.reduce((sum, p) => sum + p.blocks.length, 0);
    expect(created.blocks).toHaveLength(totalBlocks);
    // Everything is owner-scoped so PocketBase's create rule passes.
    for (const row of [...created.pages, ...created.blocks]) {
      expect((row as { owner: string }).owner).toBe('owner1');
    }
    // Pages are ordered by sort index.
    expect((created.pages[0] as { sort: number }).sort).toBe(0);
    expect((created.pages[1] as { sort: number }).sort).toBe(1);
  });
});
