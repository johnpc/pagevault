import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const cols: Record<string, { getFullList: ReturnType<typeof vi.fn> }> = {
  pages: { getFullList: vi.fn() },
  blocks: { getFullList: vi.fn() },
};
vi.mock('../../lib/pbClient', () => ({ pb: { collection: (n: string) => cols[n] } }));

const downloadText = vi.fn();
vi.mock('../../lib/download', () => ({ downloadText: (...a: unknown[]) => downloadText(...a) }));

import { useExportWorkspace } from './useExportWorkspace';

describe('useExportWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches pages + blocks and downloads one Markdown file', async () => {
    cols.pages.getFullList.mockResolvedValue([{ id: 'a', title: 'Alpha', parent: '', sort: 0 }]);
    cols.blocks.getFullList.mockResolvedValue([{ page: 'a', type: 'text', content: 'hi' }]);
    const { result } = renderHook(() => useExportWorkspace());
    await act(() => result.current.exportAll());
    await waitFor(() => expect(downloadText).toHaveBeenCalled());
    const [name, md] = downloadText.mock.calls[0];
    expect(name).toBe('pagevault-workspace.md');
    expect(md).toContain('# Alpha');
    expect(md).toContain('hi');
    // Pages fetch is scoped to non-archived.
    expect(cols.pages.getFullList).toHaveBeenCalledWith({ filter: 'archived = false' });
  });

  it('exposes a busy flag that clears after export', async () => {
    cols.pages.getFullList.mockResolvedValue([]);
    cols.blocks.getFullList.mockResolvedValue([]);
    const { result } = renderHook(() => useExportWorkspace());
    await act(() => result.current.exportAll());
    expect(result.current.busy).toBe(false);
  });
});
