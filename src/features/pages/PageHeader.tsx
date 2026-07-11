import { useState } from 'react';
import type { PageRecord } from '../../lib/pbClient';
import { CoverPicker } from './CoverPicker';
import { PageActions } from './PageActions';

interface PageHeaderProps {
  page: PageRecord;
  pages: PageRecord[];
  onTitle: (title: string) => void;
  onIcon: (icon: string) => void;
  onDelete: () => void;
  onToggleFavorite: (favorite: boolean) => void;
  onExport: () => void;
  onDuplicate: () => void;
  onCover: (id: string) => void;
  onMove: (parent: string) => void;
}

const ICONS = ['📄', '📝', '📌', '💡', '✅', '📚', '🚀', '🗂️'];

/** The page's cover + icon picker + title field + the actions row. */
export function PageHeader({
  page,
  pages,
  onTitle,
  onIcon,
  onDelete,
  onToggleFavorite,
  onExport,
  onDuplicate,
  onCover,
  onMove,
}: PageHeaderProps) {
  // The header stays mounted across /page/:id changes. Resync the local title
  // DURING render (not in an effect) when the page id changes, so a blur-save
  // never fires against the previous page — the bug where rapidly creating pages
  // wrote each title onto the prior page, blanking it.
  const [title, setTitle] = useState(page.title);
  const [seenId, setSeenId] = useState(page.id);
  if (seenId !== page.id) {
    setSeenId(page.id);
    setTitle(page.title);
  }
  return (
    <header className="pv-page-header">
      <CoverPicker cover={page.cover} onCover={onCover} />
      <div className="pv-page-icons">
        {ICONS.map((icon) => (
          <button
            key={icon}
            className={`pv-icon-choice${page.icon === icon ? ' pv-icon-choice--on' : ''}`}
            aria-label={`Set icon ${icon}`}
            onClick={() => onIcon(icon)}
          >
            {icon}
          </button>
        ))}
      </div>
      <input
        className="pv-page-title"
        aria-label="Page title"
        placeholder="Untitled"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => onTitle(title)}
      />
      <PageActions
        page={page}
        pages={pages}
        onToggleFavorite={onToggleFavorite}
        onMove={onMove}
        onDuplicate={onDuplicate}
        onExport={onExport}
        onDelete={onDelete}
      />
    </header>
  );
}
