import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { BlockRecord } from '../../lib/pbClient';
import { SharedBlock } from './SharedBlock';

const blk = (type: string, content: string, over: Partial<BlockRecord> = {}): BlockRecord =>
  ({
    id: content,
    page: 'p1',
    type,
    content,
    checked: false,
    sort: 0,
    owner: 'u1',
    ...over,
  }) as unknown as BlockRecord;

const renderBlock = (b: BlockRecord) =>
  render(<MemoryRouter>{<SharedBlock block={b} />}</MemoryRouter>);

describe('SharedBlock', () => {
  it('renders a code block preformatted, NOT as parsed markdown', () => {
    const { container } = renderBlock(blk('code', 'const x = `**not bold**`'));
    const pre = container.querySelector('pre.pv-shared-code');
    expect(pre?.textContent).toBe('const x = `**not bold**`');
    // No <strong> — the code is literal, not inline-formatted.
    expect(container.querySelector('strong')).toBeNull();
  });

  it('renders a to-do with a read-only checkbox reflecting checked', () => {
    const { container } = renderBlock(blk('todo', 'Ship it', { checked: true }));
    const box = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(box.checked).toBe(true);
    expect(box.readOnly).toBe(true);
    expect(screen.getByText('Ship it')).toBeInTheDocument();
  });

  it('renders an image block as an <img> for a safe URL', () => {
    const { container } = renderBlock(blk('image', 'https://x/i.png'));
    const img = container.querySelector('img.pv-shared-img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('https://x/i.png');
  });

  it('does not render an image for an unsafe (javascript:) URL', () => {
    const { container } = renderBlock(blk('image', 'javascript:alert(1)'));
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders a divider as <hr> and text via inline formatting', () => {
    const { container: div } = renderBlock(blk('divider', ''));
    expect(div.querySelector('hr')).not.toBeNull();
    const { container: txt } = renderBlock(blk('text', 'plain **bold**'));
    expect(txt.querySelector('strong')?.textContent).toBe('bold');
  });
});
