import { useCallback } from 'react';
import { useCreateBlock } from './blocksApi';
import { useInsertBlockAfter } from './insertBlockApi';
import type { LatestRef } from '../../lib/useLatestRef';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';

/**
 * The "add a block" actions for a page. `addBlock` appends a new block and
 * focuses it. `clickBelow` powers Notion's click-empty-space-to-write: it
 * always appends a fresh text block, and moving focus there blurs (and so
 * commits) whatever block was being edited. `insertAfter` adds an empty block
 * right below a given one (the "+" gutter) and focuses it. Split from
 * useBlockActions to keep that hook under length.
 */
export function useAddBlock(
  pageId: string,
  blocksRef: LatestRef<BlockRecord[]>,
  setFocusId: (id: string) => void,
) {
  const { mutate: createMutate } = useCreateBlock(pageId);
  const { mutate: insertMutate } = useInsertBlockAfter(pageId);

  const addBlock = useCallback(
    (type: BlockType = 'text') =>
      createMutate(
        { type, content: '', siblings: blocksRef.current },
        { onSuccess: (created) => setFocusId(created.id) },
      ),
    [createMutate, blocksRef, setFocusId],
  );

  const clickBelow = useCallback(() => addBlock('text'), [addBlock]);

  // Enter/↓ from the page title lands in the first block (adding one if the page
  // is empty) — the Notion title→body flow.
  const focusFirstOrAdd = useCallback(() => {
    const first = blocksRef.current[0];
    if (first) setFocusId(first.id);
    else addBlock('text');
  }, [blocksRef, setFocusId, addBlock]);

  const insertAfter = useCallback(
    (source: BlockRecord) =>
      insertMutate(
        { source, blocks: blocksRef.current },
        { onSuccess: (created) => setFocusId(created.id) },
      ),
    [insertMutate, blocksRef, setFocusId],
  );

  return { addBlock, clickBelow, insertAfter, focusFirstOrAdd };
}
