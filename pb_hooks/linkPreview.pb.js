/// <reference path="../pb_data/types.d.ts" />

/**
 * Link preview for bookmark blocks. The browser can't fetch a third-party page's
 * HTML for its OpenGraph tags (CORS), so this authed route does it server-side:
 *
 *   GET /api/link-preview?url={url} → { title, description, image, favicon, url }
 *
 * It fetches the page, scrapes og:title / og:description / og:image (falling back
 * to <title> and a domain favicon), and returns a compact card payload. Best
 * effort: a fetch/parse failure still returns 200 with just the domain, so the
 * client always has something to render. Requires auth so it can't be used as an
 * open proxy. NOTE: each handler runs in its own isolated JSVM runtime (goja),
 * which has NO `URL` global — everything is parsed by hand, and every helper is
 * defined INSIDE the handler.
 */

routerAdd(
  'GET',
  '/api/link-preview',
  (e) => {
    const raw = (e.requestInfo().query['url'] || '').trim();

    // Parse an http(s) URL by hand (no URL global in goja). Capture scheme, host
    // and the origin (scheme://host) for resolving relative image paths.
    const parts = /^(https?):\/\/([^/?#]+)([^?#]*)/i.exec(raw);
    if (!parts) return e.json(400, { message: 'A valid http(s) url is required.' });
    const scheme = parts[1].toLowerCase();
    const host = parts[2];
    const origin = scheme + '://' + host;
    const domain = host.replace(/^www\./, '');
    const favicon = origin + '/favicon.ico';
    const fallback = { title: domain, description: '', image: '', favicon, url: raw };

    // First attribute value of a <meta property/name="key"> tag, either order.
    const meta = (html, key) => {
      const k = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp('<meta[^>]+(?:property|name)=["\']' + k + '["\'][^>]*>', 'i');
      const tag = re.exec(html);
      if (!tag) return '';
      const c = /content=["']([^"']*)["']/i.exec(tag[0]);
      return c ? c[1].trim() : '';
    };
    const decode = (s) =>
      s
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'");

    let res;
    try {
      res = $http.send({
        url: raw,
        method: 'GET',
        headers: { 'User-Agent': 'PageVault-LinkPreview/1.0' },
        timeout: 8,
      });
    } catch (_) {
      return e.json(200, fallback);
    }
    if (res.statusCode >= 400) return e.json(200, fallback);

    // res.body is a raw byte slice — toString() decodes it to the HTML string.
    const html = toString(res.body).slice(0, 500000);
    const titleTag = /<title[^>]*>([^<]*)<\/title>/i.exec(html);

    // Resolve og:image: absolute stays, //host → scheme, /path → origin.
    let image = meta(html, 'og:image') || meta(html, 'twitter:image');
    if (image) {
      if (/^https?:\/\//i.test(image)) {
        /* absolute — keep */
      } else if (image.slice(0, 2) === '//') image = scheme + ':' + image;
      else if (image.charAt(0) === '/') image = origin + image;
      else image = origin + '/' + image;
    }

    return e.json(200, {
      title: decode(meta(html, 'og:title') || (titleTag ? titleTag[1].trim() : '') || domain),
      description: decode(meta(html, 'og:description') || meta(html, 'description')),
      image,
      favicon,
      url: raw,
    });
  },
  $apis.requireAuth(),
);
