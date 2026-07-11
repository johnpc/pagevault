/**
 * Pages server-state via react-query wrapping the PocketBase client. No page
 * fetches happen anywhere else in the app. Every write is owner-scoped by the
 * backend rules; we stamp `owner` so the create rule passes.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pb, currentUserId } from '../../lib/pbClient';
import type { PageRecord } from '../../lib/pbClient';
import { nextSort } from './pageTree';
import { runDuplicate } from './duplicate';
import { runTemplate, type Template } from './templates';

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

/** Duplicate a page and all its blocks into a sibling copy. Returns the new id. */
export function useDuplicatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: runDuplicate,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY, exact: false }),
  });
}

/** Create a new page from a template (title + preset blocks). Returns new id. */
export function useCreateFromTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { template: Template; siblings: PageRecord[] }) =>
      runTemplate(input.template, input.siblings),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY, exact: false }),
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

// Single-page flag mutations live in pageFlags.ts; re-exported so existing
// imports from './pagesApi' keep working.
export { useArchivePage, useRestorePage, useDeletePage, useToggleFavorite } from './pageFlags';
