import { useCallback, useState } from 'react';
import { useCreateBlock, useDeleteBlock, useDuplicateBlock } from './blocksApi';
import { useReorderBlocks } from './blockBatchApi';
import { useUpdateBlock } from './updateBlockApi';
import { useUploadBlockFile } from './uploadBlockFileApi';
import { moveBlock, sortUpdates } from './reorder';
import { indentDepth } from './indent';
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
  const deleteBlock = useDeleteBlock(pageId);
  const reorderBlocks = useReorderBlocks(pageId);
  const duplicateBlock = useDuplicateBlock(pageId);
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

  const moveBlockTo = useCallback(
    (fromId: string, toId: string) => {
      const reordered = moveBlock(blocks, fromId, toId);
      const updates = sortUpdates(reordered);
      if (updates.length) reorderBlocks.mutate({ reordered, updates });
    },
    [blocks, reorderBlocks],
  );

  const cloneBlock = useCallback(
    (source: BlockRecord) => duplicateBlock.mutate({ source, blocks }),
    [duplicateBlock, blocks],
  );

  const indentBlock = useCallback(
    (id: string, dir: 'in' | 'out') => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return;
      const depth = indentDepth(blocks, index, dir);
      if (depth !== (blocks[index].depth ?? 0)) updateBlock.mutate({ id, patch: { depth } });
    },
    [blocks, updateBlock],
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
    importMarkdown,
    splitBlock,
    uploadImage,
    focusId,
    clearFocusId: () => setFocusId(null),
    removeBlock: deleteBlock.mutate,
    removeBlocks: deleteBlock.mutate,
  };
}
