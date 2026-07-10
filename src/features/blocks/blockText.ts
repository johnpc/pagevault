import type { BlockType } from '../../lib/pbTypes';

/** Placeholder copy shown in an empty block, by type. Pure + tested. */
export function placeholderFor(type: BlockType): string {
  switch (type) {
    case 'heading':
      return 'Heading';
    case 'subheading':
      return 'Subheading';
    case 'todo':
      return 'To-do';
    case 'quote':
      return 'Quote';
    case 'divider':
      return '';
    default:
      return "Type '/' for a block, or just start writing…";
  }
}

/** The next type when a user cycles a block's style (toolbar button). */
export function cycleType(type: BlockType): BlockType {
  const order: BlockType[] = ['text', 'heading', 'subheading', 'todo', 'quote', 'divider'];
  return order[(order.indexOf(type) + 1) % order.length];
}
