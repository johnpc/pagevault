import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { usePageHistory } from './usePageHistory';

const blk = (id: string, content: string): BlockRecord =>
  ({ id, content, type: 'text', page: 'p1', sort: 0, owner: 'u1' }) as unknown as BlockRecord;

// A QueryClient seeded with the page's blocks — usePageHistory reads `before`
// from this cache. Tests reseed it to mimic each edit's optimistic write.
const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const setCache = (blocks: BlockRecord[]) => qc.setQueryData(['blocks', 'p1'], blocks);
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
);
const renderHistory = (raw: (id: string, patch: Partial<BlockRecord>) => void) =>
  renderHook(() => usePageHistory(raw, 'p1'), { wrapper });

const press = (key: string, opts: Partial<KeyboardEvent> = {}) =>
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key, metaKey: true, bubbles: true, ...opts }),
  );

describe('usePageHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates every edit to the raw editBlock', () => {
    const raw = vi.fn();
    setCache([blk('a', 'hello')]);
    const { result } = renderHistory(raw);
    result.current('a', { content: 'hello world' });
    expect(raw).toHaveBeenCalledWith('a', { content: 'hello world' });
  });

  it('Cmd+Z restores the pre-edit content; Cmd+Shift+Z re-applies it', () => {
    const raw = vi.fn();
    setCache([blk('a', 'v1')]);
    const { result } = renderHistory(raw);

    result.current('a', { content: 'v2' }); // records before='v1', after='v2'
    setCache([blk('a', 'v2')]);
    raw.mockClear();

    press('z'); // undo → restore 'v1'
    expect(raw).toHaveBeenCalledWith('a', { content: 'v1' });
    raw.mockClear();

    press('z', { shiftKey: true }); // redo → re-apply 'v2'
    expect(raw).toHaveBeenCalledWith('a', { content: 'v2' });
  });

  it('treats each blur-commit as its own undo step, reading `before` from the live cache', () => {
    const raw = vi.fn();
    setCache([blk('a', 'a')]);
    const { result } = renderHistory(raw);

    // Two edit sessions; the cache is updated (optimistically) between them, so
    // the 2nd edit's `before` is read as the post-1st-edit value — no staleness.
    result.current('a', { content: 'ab' });
    setCache([blk('a', 'ab')]);
    result.current('a', { content: 'abc' });
    setCache([blk('a', 'abc')]);
    raw.mockClear();

    press('z'); // undo 2nd → 'ab'
    expect(raw).toHaveBeenLastCalledWith('a', { content: 'ab' });
    press('z'); // undo 1st → 'a'
    expect(raw).toHaveBeenLastCalledWith('a', { content: 'a' });
  });

  it('does not record a no-op edit (content unchanged)', () => {
    const raw = vi.fn();
    setCache([blk('a', 'same')]);
    const { result } = renderHistory(raw);
    result.current('a', { content: 'same' });
    raw.mockClear();
    press('z');
    expect(raw).not.toHaveBeenCalled();
  });

  it('passes a non-content patch through without recording', () => {
    const raw = vi.fn();
    setCache([blk('a', 'x')]);
    const { result } = renderHistory(raw);
    result.current('a', { checked: true });
    raw.mockClear();
    press('z');
    expect(raw).not.toHaveBeenCalled();
  });
});
