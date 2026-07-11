import { useBlocks } from './blocksApi';
import { tableOfContents, blockAnchorId } from './tocData';
import './TableOfContents.css';

/** A table-of-contents block: lists the page's headings and scroll-jumps to each
 * on click. Reads the page's own blocks, so it needs no props beyond the page id
 * (carried on the block). Render-only; the entry list is a pure derivation. */
export function TableOfContents({ pageId }: { pageId: string }) {
  const { data } = useBlocks(pageId);
  const entries = tableOfContents(data ?? []);

  const jump = (id: string) => {
    document
      .getElementById(blockAnchorId(id))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="pv-toc" aria-label="Table of contents">
      {entries.length === 0 ? (
        <span className="pv-toc-empty pv-muted">Add headings to build a table of contents</span>
      ) : (
        entries.map((e) => (
          <button
            key={e.id}
            className={`pv-toc-item pv-toc-item--l${e.level}`}
            onClick={() => jump(e.id)}
          >
            {e.text}
          </button>
        ))
      )}
    </nav>
  );
}
