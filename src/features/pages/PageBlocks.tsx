import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import type { BlockDndHandlers } from '../blocks/BlockRow';
import type { useBlockActions } from '../blocks/useBlockActions';
import { BlockList } from './BlockList';

type BlockActions = ReturnType<typeof useBlockActions>;

/** Bridges usePageEditor's block-action bundle to BlockList, so PageEditor stays
 * a thin layout shell. `ed` carries editBlock/removeBlock/splitBlock/mergeBlock/
 * focus* etc.; onSubPage is page-level (navigates) so it's passed separately. */
export function PageBlocks({
  page,
  blocks,
  dnd,
  ed,
  onSubPage,
}: {
  page: PageRecord;
  blocks: { data?: BlockRecord[]; isLoading: boolean; isError: boolean; refetch: () => void };
  dnd: BlockDndHandlers;
  ed: BlockActions;
  onSubPage: () => void;
}) {
  return (
    <BlockList
      page={page}
      blocks={blocks}
      dnd={dnd}
      onEdit={ed.editBlock}
      onRemove={ed.removeBlock}
      onRemoveMany={ed.removeBlocks}
      onIndentMany={ed.indentMany}
      onDuplicate={ed.cloneBlock}
      onDuplicateMany={ed.duplicateMany}
      onInsertAfter={ed.insertAfter}
      onIndent={ed.indentBlock}
      onPasteMarkdown={ed.importMarkdown}
      onSplit={ed.splitBlock}
      onMerge={ed.mergeBlock}
      onMergeForward={ed.mergeForward}
      onUpload={ed.uploadImage}
      onMoveBlock={ed.moveBlockTo}
      onColorMany={ed.colorMany}
      onAddBlock={ed.addBlock}
      onClickBelow={ed.clickBelow}
      onSubPage={onSubPage}
      focusId={ed.focusId}
      focusCaret={ed.focusCaret}
      focusValue={ed.focusValue}
      onFocused={ed.clearFocusId}
    />
  );
}
