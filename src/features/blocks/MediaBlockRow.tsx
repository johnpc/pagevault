import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { ImageBlock } from './ImageBlock';
import { TableBlock } from './TableBlock';
import { ColumnsBlock } from './ColumnsBlock';
import { TableOfContents } from './TableOfContents';
import { BookmarkBlock } from './BookmarkBlock';
import { EmbedBlock } from './EmbedBlock';
import { BlockControls } from './BlockControls';

interface MediaProps {
  block: BlockRecord;
  cls: string;
  style: { marginLeft: string };
  rowDrag: Record<string, unknown>;
  handle: ReactNode;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (block: BlockRecord) => void;
  onUpload: (id: string, file: File) => void;
}

/** The non-text block bodies that render as a whole element (divider, image,
 * table, columns, toc, bookmark, embed) rather than an editable text line.
 * Returns null for other types so BlockRow falls through to its text body. */
export function MediaBlockRow(props: MediaProps) {
  const { block, cls, style, rowDrag, handle, onEdit, onRemove, onDuplicate, onUpload } = props;

  // The block-specific body element, keyed by type (null = not a media block).
  const body: ReactNode =
    block.type === 'divider' ? (
      <hr />
    ) : block.type === 'image' ? (
      <ImageBlock block={block} onEdit={onEdit} onUpload={onUpload} />
    ) : block.type === 'table' ? (
      <TableBlock block={block} onEdit={onEdit} />
    ) : block.type === 'columns' ? (
      <ColumnsBlock block={block} onEdit={onEdit} />
    ) : block.type === 'toc' ? (
      <TableOfContents pageId={block.page} />
    ) : block.type === 'bookmark' ? (
      <BookmarkBlock block={block} onEdit={onEdit} />
    ) : block.type === 'embed' ? (
      <EmbedBlock block={block} onEdit={onEdit} />
    ) : null;

  if (body === null) return null;

  return (
    <div className={cls} style={style} {...rowDrag}>
      {handle}
      {body}
      <BlockControls
        block={block}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onRemove={onRemove}
        withDelete={block.type === 'divider'}
      />
    </div>
  );
}
