import { Link } from 'react-router-dom';
import { parseInline } from './inlineMarkdown';

/** Renders inline markdown (bold / italic / code / strikethrough / underline),
 * page mentions, and external links as styled spans. A mention becomes a link to
 * its page; a [text](url) or bare URL becomes an external link (new tab).
 * Read-only — shown when a block is not being edited. */
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
        if (seg.href)
          return (
            <a
              key={i}
              className="pv-link"
              href={seg.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {seg.text}
            </a>
          );
        if (seg.code) return <code key={i}>{seg.text}</code>;
        if (seg.bold) return <strong key={i}>{seg.text}</strong>;
        if (seg.italic) return <em key={i}>{seg.text}</em>;
        if (seg.strike) return <del key={i}>{seg.text}</del>;
        if (seg.underline) return <u key={i}>{seg.text}</u>;
        return <span key={i}>{seg.text}</span>;
      })}
    </>
  );
}
