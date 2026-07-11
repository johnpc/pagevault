import { describe, it, expect } from 'vitest';
import { enterAction } from './enterKey';
import type { BlockRecord } from '../../lib/pbClient';

const mk = (over: Partial<BlockRecord> = {}): BlockRecord =>
  ({ id: 'b', type: 'text', content: '', depth: 0, ...over }) as unknown as BlockRecord;

describe('enterAction', () => {
  it('keeps a real newline inside a code block', () => {
    expect(enterAction(mk({ type: 'code' }), 3, 'abc')).toEqual({ kind: 'newline' });
  });

  it('splits a paragraph at the caret, new block is plain text at end', () => {
    expect(enterAction(mk({ content: 'hello world' }), 5, 'hello world')).toEqual({
      kind: 'split',
      before: 'hello',
      after: ' world',
      type: 'text',
      depth: 0,
    });
  });

  it('starts a plain paragraph when Enter is pressed at the end of a heading', () => {
    const a = enterAction(mk({ type: 'heading', content: 'Title' }), 5, 'Title');
    expect(a).toEqual({ kind: 'split', before: 'Title', after: '', type: 'text', depth: 0 });
  });

  it('keeps the heading type when splitting mid-heading', () => {
    const a = enterAction(mk({ type: 'heading', content: 'Big Title' }), 3, 'Big Title');
    expect(a).toMatchObject({ kind: 'split', type: 'heading' });
  });

  it('continues a bullet list as another bullet, preserving depth', () => {
    const a = enterAction(mk({ type: 'bullet', content: 'item', depth: 2 }), 4, 'item');
    expect(a).toEqual({ kind: 'split', before: 'item', after: '', type: 'bullet', depth: 2 });
  });

  it('exits an empty top-level list item to a paragraph', () => {
    expect(enterAction(mk({ type: 'bullet', content: '' }), 0, '')).toEqual({ kind: 'exit-list' });
  });

  it('outdents an empty nested list item instead of exiting', () => {
    expect(enterAction(mk({ type: 'todo', content: '', depth: 1 }), 0, '')).toEqual({
      kind: 'outdent',
    });
  });
});
