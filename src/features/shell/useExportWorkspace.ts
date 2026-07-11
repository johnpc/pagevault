import { useState } from 'react';
import { pb } from '../../lib/pbClient';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import { workspaceMarkdown } from '../blocks/workspaceMarkdown';
import { downloadText } from '../../lib/download';

/**
 * Export the whole (owner-scoped) workspace as one Markdown file. Fetches every
 * non-archived page + all blocks, groups blocks by page, serializes in tree
 * order, and triggers a download. Exposes a `busy` flag for the button.
 */
export function useExportWorkspace() {
  const [busy, setBusy] = useState(false);

  const exportAll = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const [pages, blocks] = await Promise.all([
        pb.collection('pages').getFullList<PageRecord>({ filter: 'archived = false' }),
        pb.collection('blocks').getFullList<BlockRecord>({ sort: 'sort' }),
      ]);
      const byPage = new Map<string, BlockRecord[]>();
      for (const b of blocks) byPage.set(b.page, [...(byPage.get(b.page) ?? []), b]);
      downloadText('pagevault-workspace.md', workspaceMarkdown(pages, byPage));
    } finally {
      setBusy(false);
    }
  };

  return { exportAll, busy };
}
