import { pb } from '../../lib/pbClient';
import type { PageRecord } from '../../lib/pbClient';
import { coverGradient } from './covers';

/** The CSS `background` for a page's cover strip: an uploaded image (as a
 * url(...) served from PocketBase) wins over a gradient id; null when neither is
 * set. Pure-ish (reads the injectable pb.files.getURL). */
export function coverBackground(
  page: Pick<PageRecord, 'coverImage' | 'cover'> & Partial<PageRecord>,
): string | null {
  if (page.coverImage) {
    const url = pb.files.getURL(page as PageRecord, page.coverImage);
    return `url("${url}") center / cover no-repeat`;
  }
  return coverGradient(page.cover ?? '');
}

/** Whether a page has any cover (uploaded image or gradient). Pure. */
export function hasCover(page: Pick<PageRecord, 'coverImage' | 'cover'>): boolean {
  return !!page.coverImage || !!coverGradient(page.cover ?? '');
}
