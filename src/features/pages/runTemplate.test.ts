import { describe, it, expect, vi, beforeEach } from 'vitest';

const pages = { create: vi.fn() };
const blocks = { create: vi.fn() };
const cols: Record<string, unknown> = { pages, blocks };
vi.mock('../../lib/pbClient', () => ({
  pb: { collection: (n: string) => cols[n] },
  currentUserId: () => 'u1',
}));

import { runTemplate, findTemplate } from './templates';

describe('runTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates the page then one block per template block, owner-stamped', async () => {
    pages.create.mockResolvedValue({ id: 'new1' });
    blocks.create.mockResolvedValue({ id: 'b' });
    const meeting = findTemplate('meeting')!;

    const id = await runTemplate(meeting, [{ sort: 4 }] as never);

    expect(id).toBe('new1');
    expect(pages.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Meeting notes', sort: 5, owner: 'u1' }),
    );
    expect(blocks.create).toHaveBeenCalledTimes(meeting.blocks.length);
    expect(blocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ page: 'new1', owner: 'u1', sort: 0 }),
    );
  });
});
