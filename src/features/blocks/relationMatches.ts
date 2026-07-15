import type { PageRecord } from '../../lib/pbClient';
import { displayTitle } from '../pages/pageTree';

/** Pages a relation cell can link to, filtered by a case-insensitive title
 * query (empty = all), archived pages excluded. Pure — unit-testable. */
export function relationMatches(pages: PageRecord[], query: string): PageRecord[] {
  const q = query.trim().toLowerCase();
  return pages
    .filter((p) => !p.archived)
    .filter((p) => q === '' || displayTitle(p).toLowerCase().includes(q));
}
