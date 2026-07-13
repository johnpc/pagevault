import type { BlockType } from '../../lib/pbTypes';
import { SLASH_COMMANDS, type SlashCommand } from './slashCommands';

/**
 * Block types you can "Turn into" from an existing text block, keeping its
 * content. Only text-body types qualify — converting a paragraph into an image,
 * table, columns, TOC, or divider would drop its text, so those are excluded.
 * Derived from the slash catalog so the two stay in sync (one source of labels).
 */
const NON_TEXT: ReadonlySet<BlockType> = new Set<BlockType>([
  'image',
  'table',
  'columns',
  'toc',
  'divider',
  'bookmark',
]);

export const TURN_INTO_TYPES: SlashCommand[] = SLASH_COMMANDS.filter((c) => !NON_TEXT.has(c.type));

/** Whether a block of this type can be turned into another text-body type. */
export const canTurnInto = (type: BlockType): boolean => !NON_TEXT.has(type);
