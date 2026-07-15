/** Select / multiselect options render as colored pills (the Notion gesture).
 * We don't store a per-option color — instead each option name maps
 * deterministically to one of the theme's tag palettes, so the same tag is
 * always the same color everywhere (cell summary + picker) with no schema
 * change and no persisted state. Pure: a stable hash of the name picks a hue. */

/** The tag background palettes available as `--pv-bg-<hue>` theme tokens
 * (themed for light + dark). Order is the color cycle. */
export const TAG_HUES = ['gray', 'yellow', 'green', 'blue', 'pink'] as const;

export type TagHue = (typeof TAG_HUES)[number];

/** Deterministic hue for an option name — a small FNV-style string hash mapped
 * onto TAG_HUES. Same name → same hue, always. An empty name is 'gray'. Pure. */
export function tagColor(name: string): TagHue {
  const trimmed = name.trim();
  if (!trimmed) return 'gray';
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash * 31 + trimmed.charCodeAt(i)) >>> 0;
  }
  return TAG_HUES[hash % TAG_HUES.length];
}
