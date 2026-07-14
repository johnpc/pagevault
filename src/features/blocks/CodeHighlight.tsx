import { useCodeHighlight } from './useCodeHighlight';

/**
 * The read-only highlighted layer painted BEHIND a code block's transparent
 * textarea. Its text metrics must match the textarea exactly (same font/size/
 * padding/whitespace — see BlockRow.css) so the colored code lines up under the
 * caret. Falls back to plain text until highlight.js loads or when the language
 * is plain/unknown. A trailing newline keeps the last line's height in sync with
 * the textarea (which reserves a line after a final \n). aria-hidden: the
 * textarea is the accessible source of truth.
 */
export function CodeHighlight({ code, lang }: { code: string; lang: string }) {
  const html = useCodeHighlight(code, lang);
  const withTrailing = code.endsWith('\n') ? code + ' ' : code;
  return (
    <pre className="pv-code-highlight hljs" aria-hidden="true">
      {html ? <code dangerouslySetInnerHTML={{ __html: html }} /> : <code>{withTrailing}</code>}
    </pre>
  );
}
