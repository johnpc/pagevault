import { useEffect, useState } from 'react';
import { highlightCode } from './highlightCode';

/**
 * Syntax-highlight `code` for a language token, lazily. highlight.js is a heavy
 * dep, so it's dynamically imported only when a code block first renders — it
 * stays out of the main bundle. Until it loads (and for an unknown/'' language)
 * this returns null and the caller shows the plain textarea text underneath.
 * Re-highlights when the code or language changes.
 */
export function useCodeHighlight(code: string, lang: string): string | null {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    highlightCode(code, lang).then((result) => {
      if (live) setHtml(result);
    });
    return () => {
      live = false;
    };
  }, [code, lang]);

  return html;
}
