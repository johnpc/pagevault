import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { BlockRecord } from '../../lib/pbClient';
import { SharedTextBlock } from './SharedTextBlock';

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
  render(<MemoryRouter>{<SharedTextBlock block={b} />}</MemoryRouter>);

describe('SharedTextBlock', () => {
  it('renders headings as their own heading levels', () => {
    expect(
      renderBlock(blk('heading', 'H')).container.querySelector('h2.pv-shared-h1'),
    ).not.toBeNull();
    expect(
      renderBlock(blk('subheading', 'H')).container.querySelector('h3.pv-shared-h2'),
    ).not.toBeNull();
    expect(
      renderBlock(blk('subsubheading', 'H')).container.querySelector('h4.pv-shared-h3'),
    ).not.toBeNull();
  });

  it('renders a quote as a blockquote', () => {
    expect(
      renderBlock(blk('quote', 'wise words')).container.querySelector('blockquote'),
    ).not.toBeNull();
  });

  it('renders a callout with its chosen emoji (default 💡)', () => {
    const chosen = renderBlock(blk('callout', 'note', { emoji: '⚠️' } as Partial<BlockRecord>));
    expect(chosen.container.querySelector('.pv-shared-callout-icon')?.textContent).toBe('⚠️');
    const def = renderBlock(blk('callout', 'note'));
    expect(def.container.querySelector('.pv-shared-callout-icon')?.textContent).toBe('💡');
  });

  it('renders bullet + numbered list items with their marker classes', () => {
    expect(
      renderBlock(blk('bullet', 'a')).container.querySelector('.pv-shared-bullet'),
    ).not.toBeNull();
    expect(
      renderBlock(blk('numbered', 'b')).container.querySelector('.pv-shared-numbered'),
    ).not.toBeNull();
  });

  it('renders inline markup safely inside the element', () => {
    const { container } = renderBlock(blk('heading', 'big **bold**'));
    expect(container.querySelector('h2 strong')?.textContent).toBe('bold');
  });

  it('falls back to a paragraph for plain text', () => {
    expect(renderBlock(blk('text', 'hi')).container.querySelector('p.pv-shared-p')).not.toBeNull();
  });
});
