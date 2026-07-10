/**
 * Pages server-state via react-query wrapping the PocketBase client. No page
 * fetches happen anywhere else in the app. Every write is owner-scoped by the
 * backend rules; we stamp `owner` so the create rule passes.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pb, currentUserId } from '../../lib/pbClient';
import type { PageRecord } from '../../lib/pbClient';
import { nextSort } from './pageTree';

const KEY = ['pages'];

export function usePages() {
  return useQuery({
    queryKey: KEY,
    queryFn: () =>
      pb.collection('pages').getFullList<PageRecord>({ filter: 'archived = false', sort: 'sort' }),
  });
}

export function usePage(id: string | undefined) {
  return useQuery({
    queryKey: ['page', id],
    enabled: !!id,
    queryFn: () => pb.collection('pages').getOne<PageRecord>(id as string),
  });
}

export function useCreatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title?: string; parent?: string; siblings: PageRecord[] }) =>
      pb.collection('pages').create<PageRecord>({
        title: input.title ?? '',
        parent: input.parent ?? '',
        sort: nextSort(input.siblings),
        owner: currentUserId(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; patch: Partial<PageRecord> }) =>
      pb.collection('pages').update<PageRecord>(input.id, input.patch),
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['page', page.id] });
    },
  });
}

/** Archived (trashed) pages, newest first — the Trash view's data. */
export function useArchivedPages() {
  return useQuery({
    queryKey: ['pages', 'archived'],
    queryFn: () =>
      pb
        .collection('pages')
        .getFullList<PageRecord>({ filter: 'archived = true', sort: '-updated' }),
  });
}

/** A page mutation that invalidates all page lists + the affected page. `getId`
 * pulls the page id from the mutation variables. Powers the writes below. */
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
