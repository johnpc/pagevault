import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';

const mutate = vi.fn();
vi.mock('./splitBlockApi', () => ({ useSplitBlock: () => ({ mutate }) }));

import { useEnterSplit } from './useEnterSplit';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

const mk = (over: Partial<BlockRecord> = {}): BlockRecord =>
  ({ id: 'b', type: 'text', content: '', depth: 0, ...over }) as unknown as BlockRecord;

const setup = () => {
  const indentBlock = vi.fn();
  const editBlock = vi.fn();
  const setFocusId = vi.fn();
  const { result } = renderHook(
    () => useEnterSplit('p1', { current: [mk()] }, { indentBlock, editBlock, setFocusId }),
    {
      wrapper,
    },
  );
  return { split: result.current, indentBlock, editBlock, setFocusId };
};

describe('useEnterSplit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false inside a code block so the textarea keeps the newline', () => {
    const { split } = setup();
    expect(split(mk({ type: 'code', content: 'x' }), 1, 'x')).toBe(false);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('splits a paragraph via the mutation and focuses the new block', () => {
    // Drive the mutation's onSuccess so the focus-next-block path is exercised.
    mutate.mockImplementation((_input, opts) => opts?.onSuccess?.({ id: 'new' }));
    const { split, setFocusId } = setup();
    expect(split(mk({ content: 'hello' }), 2, 'hello')).toBe(true);
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ before: 'he', after: 'llo', type: 'text' }),
      expect.any(Object),
    );
    expect(setFocusId).toHaveBeenCalledWith('new');
  });

  it('outdents an empty nested list item', () => {
    const { split, indentBlock } = setup();
    expect(split(mk({ type: 'bullet', content: '', depth: 1 }), 0, '')).toBe(true);
    expect(indentBlock).toHaveBeenCalledWith('b', 'out');
    expect(mutate).not.toHaveBeenCalled();
  });

  it('exits an empty top-level list item to a paragraph', () => {
    const { split, editBlock } = setup();
    expect(split(mk({ type: 'bullet', content: '' }), 0, '')).toBe(true);
    expect(editBlock).toHaveBeenCalledWith('b', { type: 'text' });
  });
});
