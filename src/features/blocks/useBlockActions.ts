import { useCallback, useState } from 'react';
import { useCreateBlock, useDuplicateBlock } from './blocksApi';
import { useDeleteWithUndo } from './useDeleteWithUndo';
import { useSetDepths } from './blockBatchApi';
import { useUpdateBlock } from './updateBlockApi';
import { useUploadBlockFile } from './uploadBlockFileApi';
import { useMoveBlock } from './useMoveBlock';
import { indentUpdates } from './indent';
import { useImportMarkdown } from './markdownImportApi';
import { markdownToBlocks } from './markdownImport';
import { useEnterSplit } from './useEnterSplit';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';

/**
 * The block-list mutations for one page: add, edit, remove, and drag-reorder.
 * Split out of usePageEditor so each surface stays small and single-purpose.
 */
export function useBlockActions(pageId: string, blocks: BlockRecord[]) {
  const createBlock = useCreateBlock(pageId);
  const updateBlock = useUpdateBlock(pageId);
  const deleteWithUndo = useDeleteWithUndo(pageId, blocks);
  const setDepths = useSetDepths(pageId);
  const duplicateBlock = useDuplicateBlock(pageId);
  const moveBlockTo = useMoveBlock(pageId, blocks);
  const uploadFile = useUploadBlockFile(pageId);
  const importMd = useImportMarkdown(pageId);
  // id of the block that should grab focus next (the one just created by Enter).
  const [focusId, setFocusId] = useState<string | null>(null);

  const addBlock = useCallback(
    (type: BlockType = 'text') =>
      createBlock.mutate(
        { type, content: '', siblings: blocks },
        { onSuccess: (created) => setFocusId(created.id) },
      ),
    [createBlock, blocks],
  );

  const editBlock = useCallback(
    (id: string, patch: Partial<BlockRecord>) => updateBlock.mutate({ id, patch }),
    [updateBlock],
  );

  const cloneBlock = useCallback(
    (source: BlockRecord) => duplicateBlock.mutate({ source, blocks }),
    [duplicateBlock, blocks],
  );

  const indentMany = useCallback(
    (ids: string[], dir: 'in' | 'out') => {
      const updates = indentUpdates(blocks, ids, dir);
      if (updates.length) setDepths.mutate(updates);
    },
    [blocks, setDepths],
  );
  // Single-block indent is just a one-id batch (same maxDepthAt cap logic).
  const indentBlock = useCallback(
    (id: string, dir: 'in' | 'out') => indentMany([id], dir),
    [indentMany],
  );

  const importMarkdown = useCallback(
    (target: BlockRecord, md: string) => {
      const parsed = markdownToBlocks(md);
      if (parsed.length) importMd.mutate({ target, parsed, blocks });
    },
    [importMd, blocks],
  );

  const splitBlock = useEnterSplit(pageId, blocks, { indentBlock, editBlock, setFocusId });

  const uploadImage = useCallback(
    (id: string, file: File) => uploadFile.mutate({ id, file }),
    [uploadFile],
  );

  return {
    addBlock,
    editBlock,
    moveBlockTo,
    cloneBlock,
    indentBlock,
    indentMany,
    importMarkdown,
    splitBlock,
    uploadImage,
    focusId,
    clearFocusId: () => setFocusId(null),
    removeBlock: deleteWithUndo,
    removeBlocks: deleteWithUndo,
  };
}
