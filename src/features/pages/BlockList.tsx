import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';
import { LoadState } from '../shell/LoadState';
import { PageInfo } from './PageInfo';
import type { BlockDndHandlers } from '../blocks/BlockRow';
import { hiddenBlockIds } from '../blocks/toggle';
import { BlockRows } from './BlockRows';

interface BlockListProps {
  page: PageRecord;
  blocks: { data?: BlockRecord[]; isLoading: boolean; isError: boolean; refetch: () => void };
  dnd: BlockDndHandlers;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onRemove: (id: string) => void;
  onRemoveMany: (ids: string[]) => void;
  onIndentMany: (ids: string[], dir: 'in' | 'out') => void;
  onDuplicate: (block: BlockRecord) => void;
  onIndent: (id: string, dir: 'in' | 'out') => void;
  onPasteMarkdown: (block: BlockRecord, text: string) => void;
  onSplit: (block: BlockRecord, caret: number, value: string) => boolean;
  onMerge: (id: string, value: string) => boolean;
  onMergeForward: (id: string, value: string) => boolean;
  onUpload: (id: string, file: File) => void;
  onMoveBlock: (fromId: string, toId: string) => void;
  onAddBlock: (type?: BlockType) => void;
  onSubPage: () => void;
  focusId: string | null;
  focusCaret?: number;
  focusValue?: string;
  onFocused: () => void;
}

/** The editable block list under the header: rows + add-block/sub-page + footer. */
export function BlockList({ page, blocks, onAddBlock, onSubPage, ...rest }: BlockListProps) {
  const all = blocks.data ?? [];
  // Children of a collapsed toggle are hidden (Notion-style) but stay in the DB.
  const hidden = hiddenBlockIds(all);
  const visible = all.filter((block) => !hidden.has(block.id));
  return (
    <LoadState
      loading={blocks.isLoading}
      error={blocks.isError}
      empty={false}
      onRetry={blocks.refetch}
    >
      <BlockRows visible={visible} {...rest} />
      <button className="pv-add-block pv-muted" onClick={() => onAddBlock('text')}>
        + Add a block
      </button>
      <button className="pv-add-block pv-muted" onClick={onSubPage}>
        + Add a sub-page
      </button>
      <PageInfo page={page} blocks={all} />
    </LoadState>
  );
}
