import { describe, it, expect, vi } from 'vitest';
import type { BlockRecord } from '../../lib/pbClient';

vi.mock('../../lib/pbClient', () => ({
  pb: {
    files: { getURL: (_r: unknown, f: string) => `https://pb.local/api/files/blocks/b1/${f}` },
  },
}));

import { imageSrc, hasImageSource } from './imageSource';

const mk = (over: Partial<BlockRecord>): BlockRecord =>
  ({ id: 'b1', file: '', content: '', ...over }) as unknown as BlockRecord;

describe('imageSrc', () => {
  it('builds the served file URL when a file is present', () => {
    expect(imageSrc(mk({ file: 'pic.png' }))).toBe('https://pb.local/api/files/blocks/b1/pic.png');
  });

  it('falls back to the remote URL in content when there is no file', () => {
    expect(imageSrc(mk({ content: 'https://x.z/a.png' }))).toBe('https://x.z/a.png');
  });

  it('returns empty when neither is set', () => {
    expect(imageSrc(mk({}))).toBe('');
  });

  it('prefers the uploaded file over a stale content URL', () => {
    const src = imageSrc(mk({ file: 'pic.png', content: 'https://x.z/old.png' }));
    expect(src).toContain('pic.png');
  });
});

describe('hasImageSource', () => {
  it('is true with a file, true with a URL, false with neither', () => {
    expect(hasImageSource(mk({ file: 'a.png' }))).toBe(true);
    expect(hasImageSource(mk({ content: 'https://x.z' }))).toBe(true);
    expect(hasImageSource(mk({}))).toBe(false);
  });
});
