import { Link } from 'react-router-dom';
import { parseInline } from './inlineMarkdown';

/** Renders inline markdown (bold / italic / code) and page mentions as styled
 * spans. A mention becomes a link to its page. Read-only — shown when a block is
 * not being edited. */
export function FormattedText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((seg, i) => {
        if (seg.mentionId)
          return (
            <Link key={i} className="pv-mention" to={`/page/${seg.mentionId}`}>
              @{seg.text}
            </Link>
          );
        if (seg.code) return <code key={i}>{seg.text}</code>;
        if (seg.bold) return <strong key={i}>{seg.text}</strong>;
        if (seg.italic) return <em key={i}>{seg.text}</em>;
        return <span key={i}>{seg.text}</span>;
      })}
    </>
  );
}
