import type { Segment } from './inlineMarkdown';

/** A "literal" inline token (its inner text isn't re-parsed as emphasis): the
 * regex plus a mapper from a match to the segment + how many source chars it
 * consumes (autolink consumes fewer than it matches — see trimAutolink). */
export interface SpecialToken {
  re: RegExp;
  match: (m: RegExpExecArray) => { length: number; segment: Segment };
}

// LINK/MENTION url part allows single-level balanced parens — `[x](…/a_(1))`
// keeps the inner ')' instead of stopping at it (common in Wikipedia URLs).
const URL_PART = '((?:[^()\\s]|\\([^()]*\\))+)';
const MENTION_RE = new RegExp('@\\[([^\\]]+)\\]\\(' + URL_PART + '\\)');
const LINK_RE = new RegExp('\\[([^\\]]+)\\]\\(' + URL_PART + '\\)');
// Autolink allows balanced paren groups, then trims trailing punctuation and any
// unbalanced ')' (so "…(bar) now" keeps the ')' but "…com." / "…com)" don't).
const AUTOLINK_RE = /https?:\/\/(?:\([^\s()]*\)|[^\s<>()])+/;

/** Strip trailing sentence punctuation and unbalanced ')' from an autolinked
 * URL, returning the kept URL. A trailing ')' stays only if it balances an
 * earlier '(' in the URL. Pure. */
export function trimAutolink(url: string): string {
  let s = url;
  while (s.length) {
    const last = s[s.length - 1];
    if ('.,;:!?'.includes(last)) {
      s = s.slice(0, -1);
      continue;
    }
    if (last === ')') {
      const opens = (s.match(/\(/g) ?? []).length;
      const closes = (s.match(/\)/g) ?? []).length;
      if (closes > opens) {
        s = s.slice(0, -1);
        continue;
      }
    }
    break;
  }
  return s;
}

/** Literal link/mention tokens, in tie-break priority order: a mention @[t](id)
 * beats a [t](url) link at the same index (its '@' is one char earlier), and an
 * explicit link beats a bare-URL autolink (its '[' precedes the inner http://). */
export const LINK_SPECIALS: SpecialToken[] = [
  {
    re: MENTION_RE,
    match: (m) => ({ length: m[0].length, segment: { text: m[1], mentionId: m[2] } }),
  },
  { re: LINK_RE, match: (m) => ({ length: m[0].length, segment: { text: m[1], href: m[2] } }) },
  {
    re: AUTOLINK_RE,
    match: (m) => {
      const url = trimAutolink(m[0]);
      return { length: url.length, segment: { text: url, href: url } };
    },
  },
];
