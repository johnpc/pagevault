import { useState } from 'react';
import type { PageRecord } from '../../lib/pbClient';
import { CoverPicker } from './CoverPicker';
import { IconPicker } from './IconPicker';
import { PageActions } from './PageActions';
import { PagePresence } from '../presence/PagePresence';
import { useReconciled } from '../blocks/useReconciled';
import type { CollapseAll } from '../blocks/useCollapseAll';

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
  onCoverUpload: (file: File) => void;
  onMove: (parent: string) => void;
  onFullWidth: (fullWidth: boolean) => void;
  onFont: (font: string) => void;
  collapse: CollapseAll;
}

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
  onCoverUpload,
  onMove,
  onFullWidth,
  onFont,
  collapse,
}: PageHeaderProps) {
  // The header stays mounted across /page/:id changes. useReconciled adopts the
  // external title (a page switch, or a realtime edit from another tab) DURING
  // render whenever this input is unfocused — so a blur-save never fires against
  // the previous page, and a live update lands without yanking the caret.
  const [focused, setFocused] = useState(false);
  const [title, setTitle] = useReconciled(page.title, focused);
  return (
    <header className="pv-page-header">
      <div className="pv-page-presence-bar">
        <PagePresence pageId={page.id} />
      </div>
      <CoverPicker page={page} onCover={onCover} onUpload={onCoverUpload} />
      <div className="pv-page-icons">
        <IconPicker icon={page.icon} onPick={onIcon} />
      </div>
      <input
        className="pv-page-title"
        aria-label="Page title"
        placeholder="Untitled"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onTitle(title);
        }}
      />
      <PageActions
        page={page}
        pages={pages}
        onToggleFavorite={onToggleFavorite}
        onMove={onMove}
        onDuplicate={onDuplicate}
        onExport={onExport}
        onFullWidth={onFullWidth}
        onFont={onFont}
        onDelete={onDelete}
        collapse={collapse}
      />
    </header>
  );
}
