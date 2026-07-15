import { useCallback } from 'react';

/** The action-bar operations over the currently-selected block ids: color them
 * all, or delete them all — each clearing the selection afterward. Split from
 * useBlockSelection to keep that hook under the line gate. */
export function useSelectionActions(
  chosen: string[],
  clear: () => void,
  onColorMany: ((ids: string[], color: string) => void) | undefined,
  onDeleteMany: (ids: string[]) => void,
) {
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
  return { colorSelected, deleteSelected };
}
