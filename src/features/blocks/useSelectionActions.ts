import { useCallback } from 'react';

interface SelectionOps {
  onColorMany?: (ids: string[], color: string) => void;
  onDeleteMany: (ids: string[]) => void;
  onDuplicateMany?: (ids: string[]) => void;
}

/** The action-bar operations over the currently-selected block ids: color them
 * all, duplicate them all, or delete them all — each clearing the selection
 * afterward. Split from useBlockSelection to keep that hook under the line gate. */
export function useSelectionActions(chosen: string[], clear: () => void, ops: SelectionOps) {
  const { onColorMany, onDeleteMany, onDuplicateMany } = ops;
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
  return { colorSelected, deleteSelected, duplicateSelected };
}
