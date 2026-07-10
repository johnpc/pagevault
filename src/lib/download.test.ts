import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadText } from './download';

describe('downloadText', () => {
  beforeEach(() => {
    // jsdom lacks URL.createObjectURL / revokeObjectURL.
    URL.createObjectURL = vi.fn(() => 'blob:mock');
    URL.revokeObjectURL = vi.fn();
  });

  it('creates an anchor with the download filename and clicks it', () => {
    const clicks: string[] = [];
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreate(tag) as HTMLAnchorElement;
      if (tag === 'a') el.click = () => clicks.push(el.download);
      return el;
    });

    downloadText('my-page.md', '# Hi');

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(clicks).toEqual(['my-page.md']);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    vi.restoreAllMocks();
  });
});
