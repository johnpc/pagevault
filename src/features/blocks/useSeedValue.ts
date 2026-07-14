/** Seed a block's local value during render when it's the autofocus target and
 * a seed value was provided (a Backspace-merge's combined content). Done in
 * render — not an effect — so the merged text paints in the same commit, and
 * before the block is focused (after which useReconciled won't adopt the
 * optimistic cache write). Guarded so it runs once per distinct seed. */
export function useSeedValue(
  active: boolean | undefined,
  seed: string | undefined,
  value: string,
  setValue: (v: string) => void,
) {
  if (active && seed != null && value !== seed) setValue(seed);
}
