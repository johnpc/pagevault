/**
 * Backlinks (linked references) for a page: every OTHER page whose blocks mention
 * it via an @[Title](id) token. Owner-scoped by the backend rules. Read-only.
 */
import { useQuery } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import { mentionMarker, buildBacklinks, type Backlink } from './backlinkGroups';

/** Escape a value for a PocketBase filter string literal. */
function escape(value: string): string {
  return value.replace(/["\\]/g, '\\$&');
}

export function useBacklinks(pageId: string | undefined) {
  return useQuery<Backlink[]>({
    queryKey: ['backlinks', pageId],
    enabled: !!pageId,
    queryFn: async () => {
      const marker = escape(mentionMarker(pageId!));
      const blocks = await pb
        .collection('blocks')
        .getFullList<BlockRecord>({ filter: `content ~ "${marker}"` });
      const pageIds = [...new Set(blocks.map((b) => b.page))].filter((id) => id !== pageId);
      const pages = await Promise.all(
        pageIds.map((id) =>
          pb
            .collection('pages')
            .getOne<PageRecord>(id)
            .catch(() => null),
        ),
      );
      const byId = new Map(pages.filter((p): p is PageRecord => !!p).map((p) => [p.id, p]));
      return buildBacklinks(pageId!, blocks, byId);
    },
  });
}
