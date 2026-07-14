import { useHistory, useParams, useLocation } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { usePageEditor } from './usePageEditor';
import { useBlockHashScroll } from './useBlockHashScroll';
import { LoadState } from '../shell/LoadState';
import { PageHeader } from './PageHeader';
import { Breadcrumbs } from './Breadcrumbs';
import { PageBlocks } from './PageBlocks';
import { Backlinks } from './Backlinks';
import { Comments } from '../comments/Comments';
import { useBlockDnd } from '../blocks/useBlockDnd';
import { useCollapseAll } from '../blocks/useCollapseAll';
import { PresenceProvider } from '../presence/PresenceProvider';
import { pageFontClass } from './pageFont';
import './PageEditor.css';

/** The main document surface: breadcrumbs + header + the editable block list. */
export function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { page, blocks, allPages, ...ed } = usePageEditor(id);
  const { setTitle, setIcon, setFavorite, setCover, setCoverImage, setParent, setFullWidth } = ed;
  const { setFont, removePage, addSubPage, duplicate, exportMarkdown } = ed;
  const dnd = useBlockDnd(ed.moveBlockTo);
  const collapse = useCollapseAll(id, blocks.data ?? []);
  // Scroll to + flash a block when arriving via a copied block link (#pv-block-…).
  useBlockHashScroll(useLocation().hash, !!blocks.data);

  const onDelete = async () => {
    await removePage(id);
    history.push('/');
  };

  const onSubPage = async () => history.push(`/page/${await addSubPage()}`);
  const onDuplicate = async () => history.push(`/page/${await duplicate()}`);

  return (
    <IonPage>
      <IonContent>
        <div
          className={`pv-page${page.data?.fullWidth ? ' pv-page--wide' : ''} ${pageFontClass(
            page.data?.font ?? '',
          )}`}
        >
          <LoadState
            loading={page.isLoading}
            error={page.isError}
            empty={false}
            onRetry={page.refetch}
          >
            {page.data && (
              <PresenceProvider pageId={id}>
                <Breadcrumbs pageId={id} />
                <PageHeader
                  page={page.data}
                  pages={allPages.data ?? []}
                  onTitle={setTitle}
                  onIcon={setIcon}
                  onDelete={onDelete}
                  onToggleFavorite={setFavorite}
                  onCover={setCover}
                  onCoverUpload={setCoverImage}
                  onMove={setParent}
                  onExport={exportMarkdown}
                  onDuplicate={onDuplicate}
                  onFullWidth={setFullWidth}
                  onFont={setFont}
                  collapse={collapse}
                />
                <PageBlocks
                  page={page.data}
                  blocks={blocks}
                  dnd={dnd}
                  ed={ed}
                  onSubPage={onSubPage}
                />
                <Backlinks pageId={id} />
                <Comments pageId={id} />
              </PresenceProvider>
            )}
          </LoadState>
        </div>
      </IonContent>
    </IonPage>
  );
}
