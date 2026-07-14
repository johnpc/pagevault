import type { BlockType } from '../../lib/pbTypes';

/** A parsed block from pasted markdown: a type, its text content, and (for list
 * items) an indentation depth derived from leading spaces. */
export interface ParsedBlock {
  type: BlockType;
  content: string;
  depth?: number;
}

/** List types whose leading indentation maps to a nesting `depth`. */
const NESTS = new Set<BlockType>(['bullet', 'numbered', 'todo']);

/** Map a single markdown line to a block (type + stripped content). Leading
 * whitespace is tolerated: for list items it becomes a nesting depth (2 spaces
 * per level, matching the exporter), so indented lists round-trip. Pure. */
function lineToBlock(line: string): ParsedBlock {
  const indent = line.length - line.trimStart().length;
  const body = line.trimStart();
  const depth = Math.floor(indent / 2);
  const rules: [RegExp, BlockType][] = [
    [/^#\s+(.*)/, 'heading'],
    [/^###\s+(.*)/, 'subsubheading'],
    [/^##\s+(.*)/, 'subheading'],
    [/^[-*]\s+(.*)/, 'bullet'],
    [/^\d+\.\s+(.*)/, 'numbered'],
    [/^>\s+(.*)/, 'quote'],
  ];
  if (/^(---|\*\*\*|___)\s*$/.test(body)) return { type: 'divider', content: '' };
  const todo = /^[-*]\s+\[( |x)\]\s+(.*)/.exec(body);
  if (todo) return { type: 'todo', content: todo[2], depth };
  for (const [re, type] of rules) {
    const m = re.exec(body);
    if (m) return NESTS.has(type) ? { type, content: m[1], depth } : { type, content: m[1] };
  }
  // A non-list line keeps its original text (leading spaces and all).
  return { type: 'text', content: line };
}

/**
 * Parse a pasted markdown document into blocks. Handles ATX headings, bullet /
 * numbered / to-do lists, quotes, dividers, fenced ``` code blocks (joined into
 * one code block), and paragraphs. Blank lines are dropped. Pure — unit-tested.
 */
export function markdownToBlocks(md: string): ParsedBlock[] {
  const out: ParsedBlock[] = [];
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let fence: string[] | null = null;

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      if (fence) {
        out.push({ type: 'code', content: fence.join('\n') });
        fence = null;
      } else {
        fence = [];
      }
      continue;
    }
    if (fence) {
      fence.push(line);
      continue;
    }
    if (line.trim() === '') continue;
    out.push(lineToBlock(line));
  }
  if (fence) out.push({ type: 'code', content: fence.join('\n') });
  return out;
}

/** True when text looks like a multi-line / markdown-y paste worth converting. */
export function looksLikeMarkdown(text: string): boolean {
  return text.includes('\n') || /^(#{1,3}\s|[-*]\s|\d+\.\s|>\s|```)/.test(text.trim());
}
