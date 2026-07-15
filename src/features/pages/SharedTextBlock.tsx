import type { BlockRecord } from '../../lib/pbClient';
import { FormattedText } from '../blocks/FormattedText';

const DEFAULT_CALLOUT = '💡';

/** The read-only render of a text-ish block on a public shared page, with the
 * right semantic element per type so the document keeps its visual hierarchy
 * (headings, quote, callout, list items) instead of flattening to body text.
 * All inner text goes through the XSS-safe FormattedText. */
export function SharedTextBlock({ block }: { block: BlockRecord }) {
  const text = <FormattedText text={block.content} />;
  switch (block.type) {
    case 'heading':
      return <h2 className="pv-shared-h1">{text}</h2>;
    case 'subheading':
      return <h3 className="pv-shared-h2">{text}</h3>;
    case 'subsubheading':
      return <h4 className="pv-shared-h3">{text}</h4>;
    case 'quote':
      return <blockquote className="pv-shared-quote">{text}</blockquote>;
    case 'callout':
      return (
        <div className="pv-shared-callout">
          <span className="pv-shared-callout-icon">{block.emoji || DEFAULT_CALLOUT}</span>
          <span>{text}</span>
        </div>
      );
    case 'bullet':
      return <div className="pv-shared-bullet">{text}</div>;
    case 'numbered':
      return <div className="pv-shared-numbered">{text}</div>;
    default:
      // text, toggle, columns, toc — a paragraph of formatted inline text.
      return <p className="pv-shared-p">{text}</p>;
  }
}
