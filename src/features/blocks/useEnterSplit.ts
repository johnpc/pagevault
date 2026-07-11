import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { useSplitBlock } from './splitBlockApi';
import { enterAction } from './enterKey';
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
export function useEnterSplit(pageId: string, blocks: BlockRecord[], deps: Deps) {
  const splitBlockMut = useSplitBlock(pageId);
  const { indentBlock, editBlock, setFocusId } = deps;

  return useCallback(
    (source: BlockRecord, caret: number, value: string) => {
      const action = enterAction(source, caret, value);
      if (action.kind === 'newline') return false; // let the textarea insert '\n'
      if (action.kind === 'outdent') indentBlock(source.id, 'out');
      else if (action.kind === 'exit-list') editBlock(source.id, { type: 'text' });
      else
        splitBlockMut.mutate(
          { source, ...action, blocks },
          { onSuccess: (created) => setFocusId(created.id) },
        );
      return true; // handled
    },
    [splitBlockMut, indentBlock, editBlock, setFocusId, blocks],
  );
}
