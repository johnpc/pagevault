/** A block's text alignment. '' = default (left). */
export type BlockAlign = '' | 'center' | 'right';

/** The alignments offered in the picker (with a glyph + label), in menu order. */
export const ALIGNMENTS: { token: BlockAlign; glyph: string; label: string }[] = [
  { token: '', glyph: '⬅', label: 'Left' },
  { token: 'center', glyph: '⬌', label: 'Center' },
  { token: 'right', glyph: '➡', label: 'Right' },
];

/** The CSS modifier class for a block's alignment, or '' for the default left.
 * Pure — an unknown token falls back to no class. */
export function alignClass(align: string | undefined): string {
  if (align === 'center') return 'pv-align--center';
  if (align === 'right') return 'pv-align--right';
  return '';
}
