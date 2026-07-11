import { describe, it, expect, vi } from 'vitest';
import type { PageRecord } from '../../lib/pbClient';

vi.mock('../../lib/pbClient', () => ({
  pb: { files: { getURL: (_r: unknown, f: string) => `https://pb.local/api/files/pages/p1/${f}` } },
}));

import { coverBackground, hasCover } from './coverSource';

const pg = (over: Partial<PageRecord>): PageRecord =>
  ({ id: 'p1', cover: '', coverImage: '', ...over }) as PageRecord;

describe('coverBackground', () => {
  it('uses the uploaded image (as a url) when set, over a gradient', () => {
    const bg = coverBackground(pg({ coverImage: 'b.png', cover: 'ocean' }));
    expect(bg).toContain('url("https://pb.local/api/files/pages/p1/b.png")');
  });

  it('falls back to the gradient when there is no image', () => {
    expect(coverBackground(pg({ cover: 'ocean' }))).toContain('linear-gradient');
  });

  it('is null when neither an image nor a valid gradient is set', () => {
    expect(coverBackground(pg({}))).toBeNull();
    expect(coverBackground(pg({ cover: 'bogus' }))).toBeNull();
  });
});

describe('hasCover', () => {
  it('is true for an image or a gradient, false otherwise', () => {
    expect(hasCover(pg({ coverImage: 'b.png' }))).toBe(true);
    expect(hasCover(pg({ cover: 'ocean' }))).toBe(true);
    expect(hasCover(pg({}))).toBe(false);
  });
});
