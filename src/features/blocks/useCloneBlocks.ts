import { useCallback } from 'react';
import { useDuplicateBlock } from './blocksApi';
import { useDuplicateMany } from './duplicateManyApi';
import type { LatestRef } from '../../lib/useLatestRef';
import type { BlockRecord } from '../../lib/pbClient';

/**
 * The block-duplication actions for a page: `cloneBlock` copies one block below
 * itself (⌘D / block menu); `duplicateMany` copies a whole selection as a run
 * below the last selected block. Both read the live blocks via a latest-ref.
 * Split from useBlockActions to keep that hook under length.
 */
export function useCloneBlocks(pageId: string, blocksRef: LatestRef<BlockRecord[]>) {
  const { mutate: duplicateMutate } = useDuplicateBlock(pageId);
  const { mutate: duplicateManyMutate } = useDuplicateMany(pageId);

  const cloneBlock = useCallback(
    (source: BlockRecord) => duplicateMutate({ source, blocks: blocksRef.current }),
    [duplicateMutate, blocksRef],
  );

  const duplicateMany = useCallback(
    (ids: string[]) => {
      const byId = new Map(blocksRef.current.map((b) => [b.id, b]));
      const sources = ids.map((id) => byId.get(id)).filter((b): b is BlockRecord => !!b);
      if (sources.length) duplicateManyMutate({ sources, blocks: blocksRef.current });
    },
    [duplicateManyMutate, blocksRef],
  );

  return { cloneBlock, duplicateMany };
}
