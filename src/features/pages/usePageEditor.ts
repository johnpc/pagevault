import { useCallback } from 'react';
import { usePage, useUpdatePage, useDeletePage } from './pagesApi';
import { useBlocks, useCreateBlock, useUpdateBlock, useDeleteBlock } from '../blocks/blocksApi';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';

/**
 * Orchestrates one page's editing surface: the page record + its blocks, plus
 * the mutations the editor needs. Keeps all logic out of the view component.
 */
export function usePageEditor(pageId: string) {
  const page = usePage(pageId);
  const blocks = useBlocks(pageId);
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();
  const createBlock = useCreateBlock(pageId);
  const updateBlock = useUpdateBlock(pageId);
  const deleteBlock = useDeleteBlock(pageId);

  const setTitle = useCallback(
    (title: string) => updatePage.mutate({ id: pageId, patch: { title } }),
    [pageId, updatePage],
  );

  const setIcon = useCallback(
    (icon: string) => updatePage.mutate({ id: pageId, patch: { icon } }),
    [pageId, updatePage],
  );

  const addBlock = useCallback(
    (type: BlockType = 'text') =>
      createBlock.mutate({ type, content: '', siblings: blocks.data ?? [] }),
    [createBlock, blocks.data],
  );

  const editBlock = useCallback(
    (id: string, patch: Partial<BlockRecord>) => updateBlock.mutate({ id, patch }),
    [updateBlock],
  );

  return {
    page,
    blocks,
    setTitle,
    setIcon,
    addBlock,
    editBlock,
    removeBlock: deleteBlock.mutate,
    removePage: deletePage.mutateAsync,
  };
}
