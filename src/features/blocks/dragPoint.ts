/** Find the drag id of the row under a screen point. Walks up from the element
 * at (x, y) to the nearest ancestor carrying `data-drag-id` and returns it, or
 * null when the point isn't over a draggable row. Used for touch/pointer
 * reordering, where there's no native dragover target. DOM-only (elementFrom
 * Point is injected so the logic is unit-testable). */
export function dragIdAtPoint(
  x: number,
  y: number,
  elementFromPoint: (x: number, y: number) => Element | null = (px, py) =>
    document.elementFromPoint(px, py),
): string | null {
  const el = elementFromPoint(x, y);
  const row = el?.closest('[data-drag-id]');
  return row?.getAttribute('data-drag-id') ?? null;
}
