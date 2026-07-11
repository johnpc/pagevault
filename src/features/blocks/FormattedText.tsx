import { parseInline } from './inlineMarkdown';

/** Renders inline markdown (bold / italic / code) as styled spans. Read-only —
 * shown when a block is not being edited. */
export function FormattedText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((seg, i) => {
        if (seg.code) return <code key={i}>{seg.text}</code>;
        if (seg.bold) return <strong key={i}>{seg.text}</strong>;
        if (seg.italic) return <em key={i}>{seg.text}</em>;
        return <span key={i}>{seg.text}</span>;
      })}
    </>
  );
}
