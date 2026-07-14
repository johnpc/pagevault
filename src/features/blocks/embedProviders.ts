/** Maps a parsed URL to an iframe embed src for a known provider, or '' when the
 * URL isn't one we can embed. Pure — no network. Each provider matches on host +
 * path shape and rewrites to the provider's official embed URL. */

const host = (u: URL, re: RegExp) => re.test(u.hostname);

/** YouTube video id from a watch/share/embed/shorts URL, else ''. */
function youtube(u: URL): string {
  if (host(u, /(^|\.)youtu\.be$/i)) return u.pathname.slice(1);
  if (host(u, /(^|\.)youtube\.com$/i)) {
    if (u.pathname === '/watch') return u.searchParams.get('v') ?? '';
    const m = /^\/(embed|shorts)\/([^/?]+)/.exec(u.pathname);
    if (m) return m[2];
  }
  return '';
}

/** Each provider: returns its embed src for a matching URL, else ''. */
const PROVIDERS: ((u: URL) => string)[] = [
  (u) => {
    const id = youtube(u);
    return id ? `https://www.youtube.com/embed/${id}` : '';
  },
  (u) => {
    const m = host(u, /(^|\.)vimeo\.com$/i) && /^\/(\d+)/.exec(u.pathname);
    return m ? `https://player.vimeo.com/video/${m[1]}` : '';
  },
  (u) => {
    // Spotify track/album/playlist/episode/show/artist → its embed player.
    const m =
      host(u, /(^|\.)spotify\.com$/i) &&
      /^\/(track|album|playlist|episode|show|artist)\/[\w]+/.exec(u.pathname);
    return m ? `https://open.spotify.com/embed${u.pathname}` : '';
  },
  (u) => {
    const m = host(u, /(^|\.)loom\.com$/i) && /^\/share\/([\w-]+)/.exec(u.pathname);
    return m ? `https://www.loom.com/embed/${m[1]}` : '';
  },
  (u) => {
    // CodePen pen → its result-tab embed.
    const m = host(u, /(^|\.)codepen\.io$/i) && /^\/([\w-]+)\/pen\/([\w-]+)/.exec(u.pathname);
    return m ? `https://codepen.io/${m[1]}/embed/${m[2]}?default-tab=result` : '';
  },
  (u) => {
    // Figma file/design/proto/board → its embed (original URL passed through).
    const ok = host(u, /(^|\.)figma\.com$/i) && /^\/(file|design|proto|board)\//.test(u.pathname);
    return ok
      ? `https://www.figma.com/embed?embed_host=pagevault&url=${encodeURIComponent(u.href)}`
      : '';
  },
  (u) => {
    // SoundCloud track/set → its player (original URL passed through).
    const ok = host(u, /(^|\.)soundcloud\.com$/i) && /^\/[\w-]+\/[\w-]+/.test(u.pathname);
    return ok
      ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.href)}&visual=true`
      : '';
  },
];

/** The iframe embed src for a URL from any known provider, or '' if none. */
export function iframeSrc(u: URL): string {
  for (const p of PROVIDERS) {
    const src = p(u);
    if (src) return src;
  }
  return '';
}
