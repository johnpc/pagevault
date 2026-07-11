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
  onAddBlock: (type?: BlockType) => void;
  onSubPage: () => void;
}

/** The editable block list under the header: rows + add-block/sub-page + footer. */
export function BlockList({
  page,
  blocks,
  dnd,
  onEdit,
  onRemove,
  onAddBlock,
  onSubPage,
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
            onEnter={() => onAddBlock('text')}
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
