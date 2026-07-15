import { useCallback } from 'react';
import { useLatestRef } from '../../lib/useLatestRef';
import { useDuplicateBlock } from './blocksApi';
import { useAddBlock } from './useAddBlock';
import { useDeleteWithUndo } from './useDeleteWithUndo';
import { useUpdateBlock } from './updateBlockApi';
import { useUploadBlockFile } from './uploadBlockFileApi';
import { useMoveBlock } from './useMoveBlock';
import { useIndent } from './useIndent';
import { useSetColors } from './useSetColors';
import { useImportMarkdown } from './markdownImportApi';
import { markdownToBlocks } from './markdownImport';
import { useEnterSplit } from './useEnterSplit';
import { useBlockMerge } from './useBlockMerge';
import { useFocusTarget } from './useFocusTarget';
import { usePageHistory } from './usePageHistory';
import type { BlockRecord } from '../../lib/pbClient';

/**
 * The block-list mutations for one page: add, edit, remove, and drag-reorder.
 * Split out of usePageEditor so each surface stays small and single-purpose.
 */
export function useBlockActions(pageId: string, blocks: BlockRecord[]) {
  // Every keystroke optimistically rewrites the blocks cache, so `blocks` gets a
  // new array identity and useMutation returns a new object. Both would churn
  // the callbacks below and defeat BlockRow's memo (all rows re-render per key).
  // So we read blocks via a latest-ref and depend only on the stable `.mutate`.
  const blocksRef = useLatestRef(blocks);
  const { mutate: updateMutate } = useUpdateBlock(pageId);
  const deleteWithUndo = useDeleteWithUndo(pageId, blocksRef);
  const { indentBlock, indentMany } = useIndent(pageId, blocksRef);
  const colorMany = useSetColors(pageId);
  const { mutate: duplicateMutate } = useDuplicateBlock(pageId);
  const moveBlockTo = useMoveBlock(pageId, blocksRef);
  const { mutate: uploadMutate } = useUploadBlockFile(pageId);
  const { mutate: importMutate } = useImportMarkdown(pageId);
  const { focusId, focusCaret, focusValue, setFocusId, focusAt, clearFocusId } = useFocusTarget();
  const { mergeUp, mergeDown } = useBlockMerge(pageId, blocksRef, { focusAt });
  const { addBlock, clickBelow } = useAddBlock(pageId, blocksRef, setFocusId);

  const editBlockRaw = useCallback(
    (id: string, patch: Partial<BlockRecord>) => updateMutate({ id, patch }),
    [updateMutate],
  );
  // Wrap edits with document-level undo/redo (Cmd/Ctrl+Z). Records content
  // changes and binds the keyboard; passes non-content patches straight through.
  const editBlock = usePageHistory(editBlockRaw, pageId);

  const cloneBlock = useCallback(
    (source: BlockRecord) => duplicateMutate({ source, blocks: blocksRef.current }),
    [duplicateMutate, blocksRef],
  );

  const importMarkdown = useCallback(
    (target: BlockRecord, md: string) => {
      const parsed = markdownToBlocks(md);
      if (parsed.length) importMutate({ target, parsed, blocks: blocksRef.current });
    },
    [importMutate, blocksRef],
  );

  const splitBlock = useEnterSplit(pageId, blocksRef, { indentBlock, editBlock, setFocusId });

  const uploadImage = useCallback(
    (id: string, file: File) => uploadMutate({ id, file }),
    [uploadMutate],
  );

  return {
    addBlock,
    clickBelow,
    editBlock,
    moveBlockTo,
    cloneBlock,
    indentBlock,
    indentMany,
    colorMany,
    importMarkdown,
    splitBlock,
    mergeBlock: mergeUp,
    mergeForward: mergeDown,
    uploadImage,
    focusId,
    focusCaret,
    focusValue,
    clearFocusId,
    removeBlock: deleteWithUndo,
    removeBlocks: deleteWithUndo,
  };
}
