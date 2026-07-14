import { urlDomain } from './bookmarkUrl';
import { useLinkPreview } from './linkPreviewApi';

/** The read-only bookmark card for a saved URL. Shows a rich preview (title,
 * description, thumbnail, favicon) scraped server-side when available, falling
 * back to a plain domain + URL card while it loads or if the fetch yields
 * nothing. The whole card is a link that opens in a new tab. */
export function BookmarkCard({ href }: { href: string }) {
  const { data } = useLinkPreview(href);
  const domain = urlDomain(href);
  const title = data?.title || domain;

  return (
    <a className="pv-bookmark-card" href={href} target="_blank" rel="noopener noreferrer">
      <div className="pv-bookmark-body">
        <span className="pv-bookmark-title">{title}</span>
        {data?.description && <span className="pv-bookmark-desc">{data.description}</span>}
        <span className="pv-bookmark-site">
          {data?.favicon && (
            <img className="pv-bookmark-favicon" src={data.favicon} alt="" aria-hidden />
          )}
          <span className="pv-bookmark-domain">{domain}</span>
        </span>
      </div>
      {data?.image && (
        <img className="pv-bookmark-thumb" src={data.image} alt="" aria-hidden loading="lazy" />
      )}
    </a>
  );
}
