/** Curated cover gradients (Notion-style banners) — DATA + a pure resolver. */
export interface Cover {
  id: string;
  label: string;
  gradient: string;
}

export const COVERS: Cover[] = [
  { id: 'sunset', label: 'Sunset', gradient: 'linear-gradient(120deg, #f6d200 0%, #ee5a24 100%)' },
  { id: 'ocean', label: 'Ocean', gradient: 'linear-gradient(120deg, #2193b0 0%, #6dd5ed 100%)' },
  { id: 'forest', label: 'Forest', gradient: 'linear-gradient(120deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'grape', label: 'Grape', gradient: 'linear-gradient(120deg, #8e2de2 0%, #4a00e0 100%)' },
  { id: 'slate', label: 'Slate', gradient: 'linear-gradient(120deg, #485563 0%, #29323c 100%)' },
  { id: 'blush', label: 'Blush', gradient: 'linear-gradient(120deg, #ff9a9e 0%, #fad0c4 100%)' },
];

/** The gradient CSS for a cover id, or null when unset/unknown. Pure. */
export function coverGradient(id: string): string | null {
  return COVERS.find((c) => c.id === id)?.gradient ?? null;
}
