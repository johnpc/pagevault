/**
 * Quick-find search server-state. Queries pages by title and blocks by content
 * (both owner-scoped by the backend rules), then merges them into page-level
 * results. No fetches happen elsewhere.
 */
import { useQuery } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import { mergeResults, type SearchResult } from './searchResults';

/** Escape a user query for a PocketBase filter string literal. */
function escape(query: string): string {
  return query.replace(/["\\]/g, '\\$&');
}

export function useSearch(query: string) {
  const q = query.trim();
  return useQuery<SearchResult[]>({
    queryKey: ['search', q],
    enabled: q.length > 0,
    queryFn: async () => {
      const safe = escape(q);
      const [pages, blocks] = await Promise.all([
        pb
          .collection('pages')
          .getFullList<PageRecord>({ filter: `archived = false && title ~ "${safe}"` }),
        pb.collection('blocks').getFullList<BlockRecord>({ filter: `content ~ "${safe}"` }),
      ]);
      const pageById = await loadPagesFor(blocks, pages);
      return mergeResults(q, pages, blocks, pageById);
    },
  });
}

/** Fetch any pages referenced by matched blocks that weren't already in the
 * page-title results, so every result can show its page title. */
async function loadPagesFor(
  blocks: BlockRecord[],
  known: PageRecord[],
): Promise<Map<string, PageRecord>> {
  const map = new Map(known.map((p) => [p.id, p]));
  const missing = [...new Set(blocks.map((b) => b.page))].filter((id) => !map.has(id));
  await Promise.all(
    missing.map((id) =>
      pb
        .collection('pages')
        .getOne<PageRecord>(id)
        .then((p) => map.set(p.id, p))
        .catch(() => undefined),
    ),
  );
  return map;
}
