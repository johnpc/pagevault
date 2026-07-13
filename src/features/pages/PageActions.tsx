import type { PageRecord } from '../../lib/pbClient';
import { MovePicker } from './MovePicker';
import { ShareButton } from './ShareButton';
import { InviteButton } from './InviteButton';
import { FontPicker } from './FontPicker';
import type { CollapseAll } from '../blocks/useCollapseAll';

export interface PageActionsProps {
  page: PageRecord;
  pages: PageRecord[];
  onToggleFavorite: (favorite: boolean) => void;
  onMove: (parent: string) => void;
  onDuplicate: () => void;
  onExport: () => void;
  onFullWidth: (fullWidth: boolean) => void;
  onFont: (font: string) => void;
  onDelete: () => void;
  collapse: CollapseAll;
}

/** The row of page-level actions under the title: favorite, move, width, font,
 * duplicate, export, trash. Kept separate so PageHeader stays small. */
export function PageActions({
  page,
  pages,
  onToggleFavorite,
  onMove,
  onDuplicate,
  onExport,
  onFullWidth,
  onFont,
  onDelete,
  collapse,
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
      <InviteButton page={page} />
      <button
        className={`pv-page-delete pv-muted${page.fullWidth ? ' pv-page-width--on' : ''}`}
        aria-label="Toggle full width"
        aria-pressed={page.fullWidth}
        onClick={() => onFullWidth(!page.fullWidth)}
      >
        {page.fullWidth ? '↔ Full width ✓' : '↔ Full width'}
      </button>
      <FontPicker current={page.font ?? ''} onPick={onFont} />
      {collapse.hasToggles && (
        <button className="pv-page-delete pv-muted" onClick={collapse.collapseAll}>
          {collapse.willCollapse ? '▸ Collapse all' : '▾ Expand all'}
        </button>
      )}
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
