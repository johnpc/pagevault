import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('./highlightCode', () => ({
  highlightCode: (code: string, lang: string) => Promise.resolve(lang ? `HL:${code}` : null),
}));

import { useCodeHighlight } from './useCodeHighlight';

describe('useCodeHighlight', () => {
  it('resolves to highlighted HTML for a language', async () => {
    const { result } = renderHook(() => useCodeHighlight('x = 1', 'python'));
    expect(result.current).toBeNull(); // before the async resolves
    await waitFor(() => expect(result.current).toBe('HL:x = 1'));
  });

  it('stays null for a plain (no) language', async () => {
    const { result } = renderHook(() => useCodeHighlight('x = 1', ''));
    await new Promise((r) => setTimeout(r, 0));
    expect(result.current).toBeNull();
  });
});
