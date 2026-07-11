import { useState } from 'react';

/**
 * Reconcile a locally-edited value with an external one (a realtime update from
 * another tab/device). The rule mirrors the title-input fix: adopt the external
 * value ONLY while the field is unfocused, so a live refetch never yanks the
 * caret or clobbers what the user is actively typing. Runs during render (not in
 * an effect) so the adopted value paints in the same commit.
 *
 * Returns the current value + a setter for local edits. `focused` is the
 * caller's own focus state; pass `false` for fields that are never focused.
 */
export function useReconciled(external: string, focused: boolean) {
  const [value, setValue] = useState(external);
  const [seen, setSeen] = useState(external);
  if (!focused && external !== seen) {
    setSeen(external);
    setValue(external);
  }
  return [value, setValue] as const;
}
