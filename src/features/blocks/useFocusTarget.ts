import { useCallback, useState } from 'react';

/** Tracks which block should grab focus next and, optionally, the caret offset
 * to land at + a value to seed. The block created by Enter (no caret/value →
 * default end, keep content) or the block a Backspace-merge joined into (caret
 * at the join, value = the merged content — seeded directly because the block is
 * focused before the optimistic cache write is adopted). Split out of
 * useBlockActions to keep it small; setFocusId is also handed to useEnterSplit. */
export function useFocusTarget() {
  const [focusId, setFocusId] = useState<string | null>(null);
  const [focusCaret, setFocusCaret] = useState<number | undefined>(undefined);
  const [focusValue, setFocusValue] = useState<string | undefined>(undefined);

  const focusAt = useCallback((id: string, caret: number, content: string) => {
    setFocusId(id);
    setFocusCaret(caret);
    setFocusValue(content);
  }, []);

  const clearFocusId = useCallback(() => {
    setFocusId(null);
    setFocusCaret(undefined);
    setFocusValue(undefined);
  }, []);

  return { focusId, focusCaret, focusValue, setFocusId, focusAt, clearFocusId };
}
