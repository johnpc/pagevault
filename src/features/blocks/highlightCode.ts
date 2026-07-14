import type { HLJSApi } from 'highlight.js';

// Cache the dynamically-imported highlight.js instance so it loads once.
let hljsPromise: Promise<HLJSApi> | null = null;
const loadHljs = (): Promise<HLJSApi> => {
  if (!hljsPromise) hljsPromise = import('highlight.js/lib/common').then((m) => m.default);
  return hljsPromise;
};

/**
 * Highlight `code` for a language token, returning HTML (with hljs-* spans) or
 * null when highlighting doesn't apply — an empty language, empty code, an
 * unknown language, or a highlight error. Async because highlight.js is lazily
 * imported. Pure w.r.t. inputs. The caller renders the HTML in a <pre> layer
 * behind the editable textarea.
 */
export async function highlightCode(code: string, lang: string): Promise<string | null> {
  if (!lang || code === '') return null;
  const hljs = await loadHljs();
  if (!hljs.getLanguage(lang)) return null; // not in the "common" bundle
  try {
    return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
  } catch {
    return null;
  }
}
