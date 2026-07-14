import type { BlockRecord } from '../../lib/pbClient';
import { FormattedText } from '../blocks/FormattedText';
import { safeHref } from '../blocks/safeHref';

/** One block in the read-only public share view, rendered per type so code,
 * to-dos, and images keep their meaning (not everything flattened to inline
 * text). Text-ish blocks use FormattedText (which is XSS-safe); divider is an
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
    default:
      return <FormattedText text={block.content} />;
  }
}
