import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';
import { LoadState } from '../shell/LoadState';
import { PageInfo } from './PageInfo';
import { BlockRow, type BlockDndHandlers } from '../blocks/BlockRow';

interface BlockListProps {
  page: PageRecord;
  blocks: { data?: BlockRecord[]; isLoading: boolean; isError: boolean; refetch: () => void };
  dnd: BlockDndHandlers;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (block: BlockRecord) => void;
  onIndent: (id: string, dir: 'in' | 'out') => void;
  onPasteMarkdown: (block: BlockRecord, text: string) => void;
  onSplit: (block: BlockRecord, caret: number, value: string) => boolean;
  onAddBlock: (type?: BlockType) => void;
  onSubPage: () => void;
  focusId: string | null;
  onFocused: () => void;
}

/** The editable block list under the header: rows + add-block/sub-page + footer. */
export function BlockList({
  page,
  blocks,
  dnd,
  onEdit,
  onRemove,
  onDuplicate,
  onIndent,
  onPasteMarkdown,
  onSplit,
  onAddBlock,
  onSubPage,
  focusId,
  onFocused,
}: BlockListProps) {
  return (
    <LoadState
      loading={blocks.isLoading}
      error={blocks.isError}
      empty={false}
      onRetry={blocks.refetch}
    >
      <div className="pv-blocks">
        {(blocks.data ?? []).map((block) => (
          <BlockRow
            key={block.id}
            block={block}
            onEdit={onEdit}
            onRemove={onRemove}
            onDuplicate={onDuplicate}
            onIndent={onIndent}
            onPasteMarkdown={onPasteMarkdown}
            onEnter={(caret, value) => onSplit(block, caret, value)}
            autoFocus={block.id === focusId}
            onFocused={onFocused}
            dnd={dnd}
          />
        ))}
      </div>
      <button className="pv-add-block pv-muted" onClick={() => onAddBlock('text')}>
        + Add a block
      </button>
      <button className="pv-add-block pv-muted" onClick={onSubPage}>
        + Add a sub-page
      </button>
      <PageInfo page={page} blocks={blocks.data ?? []} />
    </LoadState>
  );
}
