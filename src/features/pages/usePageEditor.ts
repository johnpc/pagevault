import { useCallback } from 'react';
import {
  usePage,
  useUpdatePage,
  useArchivePage,
  useCreatePage,
  usePages,
  useToggleFavorite,
} from './pagesApi';
import { useBlocks } from '../blocks/blocksApi';
import { useBlockActions } from '../blocks/useBlockActions';
import { pageToMarkdown, fileSlug } from '../blocks/exportMarkdown';
import { downloadText } from '../../lib/download';

/**
 * Orchestrates one page's editing surface: the page record + its blocks, plus
 * the mutations the editor needs. Block-list actions live in useBlockActions;
 * page-level actions are here.
 */
export function usePageEditor(pageId: string) {
  const page = usePage(pageId);
  const blocks = useBlocks(pageId);
  const updatePage = useUpdatePage();
  const archivePage = useArchivePage();
  const toggleFavorite = useToggleFavorite();
  const createPage = useCreatePage();
  const allPages = usePages();
  const blockActions = useBlockActions(pageId, blocks.data ?? []);

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

  /** Download the current page as a Markdown file. */
  const exportMarkdown = useCallback(() => {
    if (!page.data) return;
    downloadText(`${fileSlug(page.data.title)}.md`, pageToMarkdown(page.data, blocks.data ?? []));
  }, [page.data, blocks.data]);

  return {
    ...blockActions,
    addSubPage,
    exportMarkdown,
    page,
    blocks,
    setTitle,
    setIcon,
    setFavorite,
    removePage: archivePage.mutateAsync,
  };
}
