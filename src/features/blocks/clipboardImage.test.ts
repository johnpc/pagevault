import { describe, it, expect } from 'vitest';
import { clipboardImage } from './clipboardImage';

const file = new File(['x'], 'shot.png', { type: 'image/png' });
const item = (over: Partial<DataTransferItem>): DataTransferItem =>
  ({ kind: 'file', type: 'image/png', getAsFile: () => file, ...over }) as DataTransferItem;

describe('clipboardImage', () => {
  it('returns the first image file on the clipboard', () => {
    expect(clipboardImage({ items: [item({})] } as unknown as DataTransfer)).toBe(file);
  });

  it('ignores non-file items and non-image files', () => {
    const text = item({ kind: 'string', type: 'text/plain' });
    const pdf = item({ type: 'application/pdf' });
    expect(clipboardImage({ items: [text, pdf] } as unknown as DataTransfer)).toBeNull();
  });

  it('returns null when there are no items (e.g. jsdom)', () => {
    expect(clipboardImage({ items: undefined } as unknown as DataTransfer)).toBeNull();
  });
});
