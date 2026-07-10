import { useCallback } from 'react';
import {
  usePage,
  useUpdatePage,
  useArchivePage,
  useCreatePage,
  usePages,
  useToggleFavorite,
} from './pagesApi';
import {
  useBlocks,
  useCreateBlock,
  useUpdateBlock,
  useDeleteBlock,
  useReorderBlocks,
} from '../blocks/blocksApi';
import { moveBlock, sortUpdates } from '../blocks/reorder';
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
  const archivePage = useArchivePage();
  const toggleFavorite = useToggleFavorite();
  const createBlock = useCreateBlock(pageId);
  const updateBlock = useUpdateBlock(pageId);
  const deleteBlock = useDeleteBlock(pageId);
  const reorderBlocks = useReorderBlocks(pageId);
  const createPage = useCreatePage();
  const allPages = usePages();

  /** Create a child page under this one; returns the new page's id to navigate. */
  const addSubPage = useCallback(async () => {
    const siblings = (allPages.data ?? []).filter((p) => p.parent === pageId);
    const child = await createPage.mutateAsync({ parent: pageId, siblings });
    return child.id;
  }, [allPages.data, createPage, pageId]);

  const setTitle = useCallback(
    (title: string) => updatePage.mutate({ id: pageId, patch: { title } }),
    [pageId, updatePage],
  );

  const setIcon = useCallback(
    (icon: string) => updatePage.mutate({ id: pageId, patch: { icon } }),
    [pageId, updatePage],
  );

  const setFavorite = useCallback(
    (favorite: boolean) => toggleFavorite.mutate({ id: pageId, favorite }),
    [pageId, toggleFavorite],
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

  const moveBlockTo = useCallback(
    (fromId: string, toId: string) => {
      const reordered = moveBlock(blocks.data ?? [], fromId, toId);
      const updates = sortUpdates(reordered);
      if (updates.length) reorderBlocks.mutate({ reordered, updates });
    },
    [blocks.data, reorderBlocks],
  );

  return {
    moveBlockTo,
    addSubPage,
    page,
    blocks,
    setTitle,
    setIcon,
    setFavorite,
    addBlock,
    editBlock,
    removeBlock: deleteBlock.mutate,
    removePage: archivePage.mutateAsync,
  };
}
