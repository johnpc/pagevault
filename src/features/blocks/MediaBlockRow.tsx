import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { ImageBlock } from './ImageBlock';
import { TableBlock } from './TableBlock';
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

/** The non-text block bodies that render as a whole element (divider rule, image,
 * table) rather than an editable text line. Returns null for other types so
 * BlockRow can fall through to its text body. Keeps BlockRow under length. */
export function MediaBlockRow(props: MediaProps) {
  const { block, cls, style, rowDrag, handle, onEdit, onRemove, onDuplicate, onUpload } = props;
  const controls = <BlockControls block={block} onDuplicate={onDuplicate} onRemove={onRemove} />;

  if (block.type === 'divider') {
    return (
      <div className={cls} style={style} {...rowDrag}>
        {handle}
        <hr />
        <BlockControls block={block} onDuplicate={onDuplicate} onRemove={onRemove} withDelete />
      </div>
    );
  }

  if (block.type === 'image') {
    return (
      <div className={cls} style={style} {...rowDrag}>
        {handle}
        <ImageBlock block={block} onEdit={onEdit} onUpload={onUpload} />
        {controls}
      </div>
    );
  }

  if (block.type === 'table') {
    return (
      <div className={cls} style={style} {...rowDrag}>
        {handle}
        <TableBlock block={block} onEdit={onEdit} />
        {controls}
      </div>
    );
  }

  return null;
}
