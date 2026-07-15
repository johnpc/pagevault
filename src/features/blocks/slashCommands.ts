import { SLASH_COMMANDS, type SlashCommand } from './slashCatalog';

// Re-export the catalog + types so existing importers of './slashCommands' are
// unaffected; the record list itself lives in slashCatalog.ts (a data file).
export { SLASH_COMMANDS } from './slashCatalog';
export type { SlashCommand, SlashGroup } from './slashCatalog';

/**
 * The commands matching a slash query (the text after '/', without the slash):
 * everything for an empty query, else a label-substring or keyword-prefix match.
 * Pure. Shared by the start-of-line and mid-line slash paths.
 */
export function filterCommands(query: string): SlashCommand[] {
  const q = query.trim().toLowerCase();
  if (q === '') return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter(
    (cmd) => cmd.label.toLowerCase().includes(q) || cmd.keywords.some((k) => k.startsWith(q)),
  );
}
