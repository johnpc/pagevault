/**
 * Single-page flag mutations (archive / restore / permanent delete / favorite).
 * Each invalidates all page lists + the affected page. Split from pagesApi to
 * keep both files small and single-purpose.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';

const KEY = ['pages'];

/** A page mutation that invalidates all page lists + the affected page. `getId`
 * pulls the page id from the mutation variables. */
function usePageMutation<V>(fn: (v: V) => Promise<unknown>, getId: (v: V) => string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: KEY, exact: false });
      qc.invalidateQueries({ queryKey: ['page', getId(v)] });
    },
  });
}

const byId = (v: string) => v;

/** Move a page to the trash (soft delete). Reversible via restore. */
export const useArchivePage = () =>
  usePageMutation((id: string) => pb.collection('pages').update(id, { archived: true }), byId);

/** Restore a page from the trash. */
export const useRestorePage = () =>
  usePageMutation((id: string) => pb.collection('pages').update(id, { archived: false }), byId);

/** Permanently delete a page (from the trash — cascades to its blocks). */
export const useDeletePage = () =>
  usePageMutation((id: string) => pb.collection('pages').delete(id), byId);

/** Pin/unpin a page to the sidebar Favorites section. */
export const useToggleFavorite = () =>
  usePageMutation(
    (v: { id: string; favorite: boolean }) =>
      pb.collection('pages').update(v.id, { favorite: v.favorite }),
    (v) => v.id,
  );
