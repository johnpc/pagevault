import type { BlockRecord } from '../../lib/pbClient';
import type { TableData } from '../../lib/pbTypes';
import { FormattedText } from '../blocks/FormattedText';
import { safeHref } from '../blocks/safeHref';
import { SharedTable } from './SharedTable';
import { SharedTextBlock } from './SharedTextBlock';

/** One block in the read-only public share view, rendered per type so code,
 * to-dos, and images keep their meaning (not everything flattened to inline
 * text). Text-ish blocks (heading/quote/callout/list/…) go through
 * SharedTextBlock so the document keeps its visual hierarchy; divider is an
 * <hr>. No editing affordances — this is the logged-out reader's view. */
export function SharedBlock({ block }: { block: BlockRecord }) {
  switch (block.type) {
    case 'divider':
      return <hr />;
    case 'code':
      // Preformatted + literal — never parse code as inline markdown.
      return (
        <pre className="pv-shared-code">
          <code>{block.content}</code>
        </pre>
      );
    case 'todo':
      return (
        <label className="pv-shared-todo">
          <input type="checkbox" checked={!!block.checked} readOnly />
          <FormattedText text={block.content} />
        </label>
      );
    case 'image': {
      // Only render a safe-scheme src (http/https); a data:/javascript: URL from
      // a shared page is not honored.
      const src = safeHref(block.content);
      return src ? <img className="pv-shared-img" src={src} alt="" loading="lazy" /> : null;
    }
    case 'table':
      // Table/board/gallery/calendar all read the same grid data.
      return <SharedTable data={(block.data as TableData | null) ?? null} />;
    case 'bookmark':
    case 'embed': {
      // A URL lives in content; show it as a plain link (a safe scheme only)
      // rather than the raw string. Rich card/player is editor-only.
      const href = safeHref(block.content);
      return href ? (
        <a className="pv-link" href={href} target="_blank" rel="noopener noreferrer">
          {block.content}
        </a>
      ) : null;
    }
    default:
      return <SharedTextBlock block={block} />;
  }
}
