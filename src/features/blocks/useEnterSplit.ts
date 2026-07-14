import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { useSplitBlock } from './splitBlockApi';
import { enterAction } from './enterKey';
import type { LatestRef } from '../../lib/useLatestRef';
import type { BlockRecord } from '../../lib/pbClient';

interface Deps {
  indentBlock: (id: string, dir: 'in' | 'out') => void;
  editBlock: (id: string, patch: Partial<BlockRecord>) => void;
  setFocusId: Dispatch<SetStateAction<string | null>>;
}

/**
 * The Enter-key behavior for a block: split at the caret into a new block right
 * below (Notion feel), continue/exit a list, or fall through to a real newline
 * inside code. Returns true when handled (caller then prevents the default).
 */
export function useEnterSplit(pageId: string, blocks: LatestRef<BlockRecord[]>, deps: Deps) {
  const { mutate: splitMutate } = useSplitBlock(pageId);
  const { indentBlock, editBlock, setFocusId } = deps;

  return useCallback(
    (source: BlockRecord, caret: number, value: string) => {
      const action = enterAction(source, caret, value);
      if (action.kind === 'newline') return false; // let the textarea insert '\n'
      if (action.kind === 'outdent') indentBlock(source.id, 'out');
      else if (action.kind === 'exit-list') editBlock(source.id, { type: 'text' });
      else
        splitMutate(
          { source, ...action, blocks: blocks.current },
          { onSuccess: (created) => setFocusId(created.id) },
        );
      return true; // handled
    },
    [splitMutate, indentBlock, editBlock, setFocusId, blocks],
  );
}
