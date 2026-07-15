/**
 * Comments server-state for a page (owner-scoped by the backend rules). Read the
 * list, add a comment, delete one — all via the shared pb client wrapped in
 * react-query. No comment fetches happen elsewhere.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pb, currentUserId } from '../../lib/pbClient';
import type { CommentRecord } from '../../lib/pbClient';

const key = (pageId: string) => ['comments', pageId];

export function useComments(pageId: string | undefined) {
  return useQuery({
    queryKey: key(pageId ?? ''),
    enabled: !!pageId,
    queryFn: () =>
      pb
        .collection('comments')
        .getFullList<CommentRecord>({ filter: `page = '${pageId}'`, sort: 'created' }),
  });
}

export function useAddComment(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      pb
        .collection('comments')
        .create<CommentRecord>({ page: pageId, body, owner: currentUserId() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
}

export function useUpdateComment(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      pb.collection('comments').update<CommentRecord>(id, { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
}

export function useDeleteComment(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pb.collection('comments').delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
}
