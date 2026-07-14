import { normalizeUrl } from './bookmarkUrl';
import { iframeSrc } from './embedProviders';

/** How a media URL should be embedded. */
export type EmbedKind = 'video' | 'audio' | 'iframe' | 'none';

/** The embeddable form of a media URL: its kind + the src to use. Direct media
 * files play in native <video>/<audio>; a known provider link (YouTube, Vimeo,
 * Spotify, Loom, CodePen, Figma, SoundCloud) becomes an <iframe> with that
 * provider's embed URL. Anything else is 'none' (nothing to render). Pure. */
export interface Embed {
  kind: EmbedKind;
  src: string;
}

const VIDEO_EXT = /\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i;
const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i;

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
  const src = iframeSrc(parsed);
  return src ? { kind: 'iframe', src } : { kind: 'none', src: '' };
}
