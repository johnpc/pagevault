/** A selectable block color: a token stored in `block.color`, its menu label,
 * and a swatch to preview it. '' is the default (no tint). */
export interface BlockColor {
  token: string;
  label: string;
  swatch: string; // a short glyph/letter for the picker
}

/** Text colors then background ("-bg") colors, matching Notion's palette shape.
 * The token maps to a `.pv-color--<token>` CSS class on the block row. */
export const BLOCK_COLORS: BlockColor[] = [
  { token: '', label: 'Default', swatch: 'A' },
  { token: 'gray', label: 'Gray', swatch: 'A' },
  { token: 'red', label: 'Red', swatch: 'A' },
  { token: 'orange', label: 'Orange', swatch: 'A' },
  { token: 'green', label: 'Green', swatch: 'A' },
  { token: 'blue', label: 'Blue', swatch: 'A' },
  { token: 'purple', label: 'Purple', swatch: 'A' },
  { token: 'gray-bg', label: 'Gray background', swatch: '▉' },
  { token: 'yellow-bg', label: 'Yellow background', swatch: '▉' },
  { token: 'green-bg', label: 'Green background', swatch: '▉' },
  { token: 'blue-bg', label: 'Blue background', swatch: '▉' },
  { token: 'pink-bg', label: 'Pink background', swatch: '▉' },
];

const VALID = new Set(BLOCK_COLORS.map((c) => c.token));

/** The CSS class for a color token, or '' for the default / an unknown token.
 * Pure — keeps BlockRow's className assembly trivial + safe. */
export function colorClass(color: string | undefined): string {
  return color && VALID.has(color) ? `pv-color--${color}` : '';
}
