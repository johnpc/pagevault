import { useCallback } from 'react';
import type { BlockType } from '../../lib/pbTypes';

interface SelectionOps {
  onColorMany?: (ids: string[], color: string) => void;
  onDeleteMany: (ids: string[]) => void;
  onDuplicateMany?: (ids: string[]) => void;
  onTypeMany?: (ids: string[], type: BlockType) => void;
}

/** The action-bar operations over the currently-selected block ids: color,
 * turn-into (change type), duplicate, or delete them all — each clearing the
 * selection afterward. Split from useBlockSelection to keep it under the gate. */
export function useSelectionActions(chosen: string[], clear: () => void, ops: SelectionOps) {
  const { onColorMany, onDeleteMany, onDuplicateMany, onTypeMany } = ops;
  const colorSelected = useCallback(
    (color: string) => {
      if (chosen.length) onColorMany?.(chosen, color);
      clear();
    },
    [chosen, clear, onColorMany],
  );
  const deleteSelected = useCallback(() => {
    if (chosen.length) onDeleteMany(chosen);
    clear();
  }, [chosen, clear, onDeleteMany]);
  const duplicateSelected = useCallback(() => {
    if (chosen.length) onDuplicateMany?.(chosen);
    clear();
  }, [chosen, clear, onDuplicateMany]);
  const turnIntoSelected = useCallback(
    (type: BlockType) => {
      if (chosen.length) onTypeMany?.(chosen, type);
      clear();
    },
    [chosen, clear, onTypeMany],
  );
  return { colorSelected, deleteSelected, duplicateSelected, turnIntoSelected };
}
