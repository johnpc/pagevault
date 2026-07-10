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

export function useDeletePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pb.collection('pages').delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
