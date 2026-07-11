/** A selectable page typeface: the stored token + display label + the CSS class
 * that applies its font-family. '' and 'default' both mean the sans reading
 * font (no class). */
export interface PageFont {
  token: string;
  label: string;
  cls: string;
}

export const PAGE_FONTS: PageFont[] = [
  { token: 'default', label: 'Default', cls: '' },
  { token: 'serif', label: 'Serif', cls: 'pv-font-serif' },
  { token: 'mono', label: 'Mono', cls: 'pv-font-mono' },
];

/** The body class for a page's stored font token ('' / 'default' → none). */
export const pageFontClass = (token: string): string =>
  PAGE_FONTS.find((f) => f.token === token)?.cls ?? '';

/** The label for a stored font token (unknown/empty → 'Default'). */
export const pageFontLabel = (token: string): string =>
  PAGE_FONTS.find((f) => f.token === token)?.label ?? 'Default';
