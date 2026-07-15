import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';

vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => ({ create: vi.fn(), update: vi.fn(), delete: vi.fn() }) },
  currentUserId: () => 'u1',
}));

import { useBlockActions } from './useBlockActions';

// A SINGLE client for the hook's lifetime — recreating it per render would
// churn every mutation's identity and mask the very stability we're asserting.
const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
);

const mk = (id: string, sort: number): BlockRecord =>
  ({ id, page: 'p1', type: 'text', content: id, sort, owner: 'u1' }) as unknown as BlockRecord;

// The block-action callbacks are handed to a memoized BlockRow. Typing rewrites
// the blocks cache optimistically, so `blocks` gets a NEW array identity every
// keystroke. This asserts the callbacks keep a STABLE identity across that — if
// they didn't, every row would re-render on each character (the jank cliff).
describe('useBlockActions callback stability', () => {
  it('keeps handler identities stable when the blocks array reference changes', () => {
    const { result, rerender } = renderHook(({ blocks }) => useBlockActions('p1', blocks), {
      wrapper,
      initialProps: { blocks: [mk('a', 0), mk('b', 1)] },
    });
    const before = result.current;

    // Simulate a keystroke: a brand-new array (same data) replaces the cache.
    rerender({ blocks: [mk('a', 0), mk('b', 1)] });
    const after = result.current;

    for (const key of [
      'editBlock',
      'addBlock',
      'clickBelow',
      'insertAfter',
      'focusFirstOrAdd',
      'cloneBlock',
      'duplicateMany',
      'copyMany',
      'colorMany',
      'typeMany',
      'indentBlock',
      'indentMany',
      'importMarkdown',
      'splitBlock',
      'mergeBlock',
      'mergeForward',
      'removeBlock',
      'moveBlockTo',
      'uploadImage',
    ] as const) {
      expect(after[key], `${key} should be identity-stable`).toBe(before[key]);
    }
  });
});
