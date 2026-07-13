/** Focusable-element helpers for trapping keyboard focus inside an open popover.
 * Pure/DOM-query only — no React — so the cycle logic is unit-testable. */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Every focusable element inside `root`, in DOM order. */
export function focusables(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
}

/** The element that should receive focus for a Tab (shift=false) or Shift+Tab
 * (shift=true) from `active`, cycling around the ends of `list`. Returns null
 * when there's nothing to focus. Pure. */
export function nextFocus(
  list: HTMLElement[],
  active: Element | null,
  shift: boolean,
): HTMLElement | null {
  if (list.length === 0) return null;
  const i = active instanceof HTMLElement ? list.indexOf(active) : -1;
  if (shift) return i <= 0 ? list[list.length - 1] : list[i - 1];
  return i === -1 || i === list.length - 1 ? list[0] : list[i + 1];
}
