/**
 * Upload an image file into a block: send it as multipart form data (also
 * clearing any prior remote URL in `content`, so the uploaded file wins). Kept
 * separate from blocksApi so each file stays small and single-purpose.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';

export function useUploadBlockFile(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; file: File }) => {
      const data = new FormData();
      data.append('file', input.file);
      data.append('content', '');
      return pb.collection('blocks').update<BlockRecord>(input.id, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks', pageId] }),
  });
}
