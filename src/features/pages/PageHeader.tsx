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
  const [title, setTitle] = useState(page.title);
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
