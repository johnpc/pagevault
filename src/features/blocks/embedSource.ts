import { normalizeUrl } from './bookmarkUrl';

/** How a media URL should be embedded. */
export type EmbedKind = 'video' | 'audio' | 'iframe' | 'none';

/** The embeddable form of a media URL: its kind + the src to use. Direct media
 * files play in native <video>/<audio>; YouTube/Vimeo links become an <iframe>
 * with a normalized embed URL. Anything else is 'none' (nothing to render).
 * Pure — no network. */
export interface Embed {
  kind: EmbedKind;
  src: string;
}

const VIDEO_EXT = /\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i;
const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i;

/** YouTube video id from a watch/share/embed/shorts URL, else ''. Pure. */
function youtubeId(u: URL): string {
  if (/(^|\.)youtu\.be$/i.test(u.hostname)) return u.pathname.slice(1);
  if (/(^|\.)youtube\.com$/i.test(u.hostname)) {
    if (u.pathname === '/watch') return u.searchParams.get('v') ?? '';
    const m = /^\/(embed|shorts)\/([^/?]+)/.exec(u.pathname);
    if (m) return m[2];
  }
  return '';
}

/** Vimeo numeric id from a vimeo.com URL, else ''. Pure. */
function vimeoId(u: URL): string {
  if (!/(^|\.)vimeo\.com$/i.test(u.hostname)) return '';
  const m = /^\/(\d+)/.exec(u.pathname);
  return m ? m[1] : '';
}

/** Classify a media URL and produce its embeddable src. Pure. */
export function embedFor(raw: string): Embed {
  const url = normalizeUrl(raw);
  if (!url) return { kind: 'none', src: '' };
  if (VIDEO_EXT.test(url)) return { kind: 'video', src: url };
  if (AUDIO_EXT.test(url)) return { kind: 'audio', src: url };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { kind: 'none', src: '' };
  }
  const yt = youtubeId(parsed);
  if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt}` };
  const vim = vimeoId(parsed);
  if (vim) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vim}` };
  return { kind: 'none', src: '' };
}
