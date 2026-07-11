import type { PageRecord } from '../../lib/pbClient';
import { MovePicker } from './MovePicker';
import { ShareButton } from './ShareButton';

export interface PageActionsProps {
  page: PageRecord;
  pages: PageRecord[];
  onToggleFavorite: (favorite: boolean) => void;
  onMove: (parent: string) => void;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete: () => void;
}

/** The row of page-level actions under the title: favorite, move, duplicate,
 * export, trash. Kept separate so PageHeader stays small. */
export function PageActions({
  page,
  pages,
  onToggleFavorite,
  onMove,
  onDuplicate,
  onExport,
  onDelete,
}: PageActionsProps) {
  return (
    <div className="pv-page-actions">
      <button
        className={`pv-page-fav${page.favorite ? ' pv-page-fav--on' : ''}`}
        aria-label={page.favorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={page.favorite}
        onClick={() => onToggleFavorite(!page.favorite)}
      >
        {page.favorite ? '★ Favorited' : '☆ Favorite'}
      </button>
      <MovePicker page={page} pages={pages} onMove={onMove} />
      <ShareButton page={page} />
      <button className="pv-page-delete pv-muted" onClick={onDuplicate}>
        Duplicate
      </button>
      <button className="pv-page-delete pv-muted" onClick={onExport}>
        Export Markdown
      </button>
      <button className="pv-page-delete pv-muted" onClick={onDelete}>
        Move to trash
      </button>
    </div>
  );
}
