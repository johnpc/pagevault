import { useQuery } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';

/** The card payload for a bookmarked URL, from GET /api/link-preview. Scraped
 * server-side (OpenGraph / <title>) because CORS blocks a client fetch. Any
 * missing field is ''. */
export interface LinkPreview {
  title: string;
  description: string;
  image: string;
  favicon: string;
  url: string;
}

/** Fetch a bookmark's rich preview (title/description/image/favicon). Cached by
 * url and long-lived — a link's metadata rarely changes, so we don't refetch on
 * remount. Disabled until there's a url; returns null on any failure so the
 * caller falls back to a plain domain card. */
export function useLinkPreview(url: string | undefined) {
  return useQuery({
    queryKey: ['link-preview', url],
    enabled: !!url,
    staleTime: 1000 * 60 * 60 * 24, // a day — metadata is effectively static
    gcTime: 1000 * 60 * 60 * 24,
    queryFn: () =>
      pb
        .send<LinkPreview>(`/api/link-preview?url=${encodeURIComponent(url as string)}`, {
          method: 'GET',
        })
        .catch(() => null),
  });
}
