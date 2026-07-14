/**
 * Convert PageVault's internal inline tokens in a block's content into portable
 * Markdown for export. Currently: a page mention `@[Title](pageId)` becomes a
 * relative Markdown link `[Title](/page/pageId)`, so an exported doc shows a
 * readable link instead of the raw internal token. Other inline markup (bold,
 * italic, links, autolinks) is already standard Markdown and passes through
 * unchanged. Pure — no I/O. NOT applied to code blocks (their content is literal).
 */
const MENTION_RE = /@\[([^\]]+)\]\(([^)]+)\)/g;

export function inlineToMarkdown(content: string): string {
  return (content ?? '').replace(
    MENTION_RE,
    (_all, title: string, id: string) => `[${title}](/page/${id})`,
  );
}
