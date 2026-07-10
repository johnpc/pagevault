import { useState } from 'react';
import type { PageRecord } from '../../lib/pbClient';

interface PageHeaderProps {
  page: PageRecord;
  onTitle: (title: string) => void;
  onIcon: (icon: string) => void;
  onDelete: () => void;
}

const ICONS = ['📄', '📝', '📌', '💡', '✅', '📚', '🚀', '🗂️'];

/** The page's icon picker + title field + delete control. */
export function PageHeader({ page, onTitle, onIcon, onDelete }: PageHeaderProps) {
  const [title, setTitle] = useState(page.title);
  return (
    <header className="pv-page-header">
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
      <button className="pv-page-delete pv-muted" onClick={onDelete}>
        Delete page
      </button>
    </header>
  );
}
