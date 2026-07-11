/**
 * Upload a cover image for a page (multipart form data), clearing any gradient
 * `cover` so the uploaded image wins. Passing `file: null` removes the cover
 * image. Kept separate from pagesApi so each file stays small.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';
import type { PageRecord } from '../../lib/pbClient';

const KEY = ['pages'];

export function useUploadCover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; file: File }) => {
      const data = new FormData();
      data.append('coverImage', input.file);
      data.append('cover', '');
      return pb.collection('pages').update<PageRecord>(input.id, data);
    },
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['page', page.id] });
    },
  });
}
