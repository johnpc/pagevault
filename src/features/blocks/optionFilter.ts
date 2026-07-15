/** Filtering for a select/multiselect picker as you type in its add-option box —
 * the Notion gesture: the query narrows the visible options (case-insensitively)
 * and "Create <query>" is offered only when the trimmed query is non-empty and
 * doesn't already exist (case-insensitively). Pure. */

/** Options whose name contains `query` (case-insensitive). A blank query keeps
 * all options, in their original order. */
export function filterOptions(options: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter((o) => o.toLowerCase().includes(q));
}

/** The exact create-able name for `query`, or '' when nothing should be offered:
 * blank query, or a query that already matches an existing option (ignoring case
 * + surrounding whitespace). Returns the trimmed query when it's genuinely new. */
export function creatableOption(options: string[], query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return '';
  const exists = options.some((o) => o.toLowerCase() === trimmed.toLowerCase());
  return exists ? '' : trimmed;
}
