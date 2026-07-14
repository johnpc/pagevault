/** A formatting action offered by the floating selection toolbar. `marker` is
 * the inline-markdown marker wrapped around the selection (reuses wrapSelection).
 * `link` marks the special "make a link" action (handled separately). Pure DATA. */
export interface ToolbarAction {
  key: string;
  label: string; // shown as the button text/glyph
  title: string; // accessible name / tooltip
  marker?: string;
}

/** The toolbar's format buttons, in order. Markers match FORMAT/SHIFT markers. */
export const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { key: 'bold', label: 'B', title: 'Bold', marker: '**' },
  { key: 'italic', label: 'i', title: 'Italic', marker: '*' },
  { key: 'underline', label: 'U', title: 'Underline', marker: '__' },
  { key: 'strike', label: 'S', title: 'Strikethrough', marker: '~~' },
  { key: 'code', label: '<>', title: 'Code', marker: '`' },
];

/** Whether a toolbar should show for a textarea's current selection: a non-empty
 * range in a non-code block (code contents are literal). Pure. */
export function shouldShowToolbar(
  isCode: boolean,
  selectionStart: number,
  selectionEnd: number,
): boolean {
  return !isCode && selectionEnd > selectionStart;
}

/** The top-center anchor point (viewport coords) for the toolbar, given the
 * textarea's bounding rect — placed just above the field. Pure. */
export function toolbarAnchor(rect: { top: number; left: number; width: number }): {
  top: number;
  left: number;
} {
  return { top: rect.top, left: rect.left + rect.width / 2 };
}
