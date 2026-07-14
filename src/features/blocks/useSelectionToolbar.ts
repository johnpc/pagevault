import { useCallback, useState, type RefObject } from 'react';
import { wrapSelection } from './wrapSelection';
import { shouldShowToolbar, toolbarAnchor } from './selectionFormat';

/** The floating selection-toolbar state for one block's textarea. `anchor` is
 * the viewport point to position above (null = hidden). `apply(marker)` wraps the
 * current selection and keeps it selected so the user can stack formats. */
export interface SelectionToolbar {
  anchor: { top: number; left: number } | null;
  apply: (marker: string) => void;
  /** Call on the textarea's select/blur/scroll to recompute visibility. */
  sync: () => void;
  hide: () => void;
}

export function useSelectionToolbar(
  inputRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  setValue: (v: string) => void,
  isCode: boolean,
): SelectionToolbar {
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);

  const sync = useCallback(() => {
    const el = inputRef.current;
    if (!el || !shouldShowToolbar(isCode, el.selectionStart, el.selectionEnd)) {
      setAnchor(null);
      return;
    }
    setAnchor(toolbarAnchor(el.getBoundingClientRect()));
  }, [inputRef, isCode]);

  const hide = useCallback(() => setAnchor(null), []);

  const apply = useCallback(
    (marker: string) => {
      const el = inputRef.current;
      if (!el) return;
      const next = wrapSelection(value, el.selectionStart, el.selectionEnd, marker);
      setValue(next.value);
      // Keep the (now shifted) selection so formats can be stacked; re-anchor.
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(next.start, next.end);
        sync();
      });
    },
    [inputRef, value, setValue, sync],
  );

  return { anchor, apply, sync, hide };
}
