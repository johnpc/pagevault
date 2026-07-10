import { useHistory, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { usePageEditor } from './usePageEditor';
import { LoadState } from '../shell/LoadState';
import { PageHeader } from './PageHeader';
import { Breadcrumbs } from './Breadcrumbs';
import { BlockRow } from '../blocks/BlockRow';
import { useBlockDnd } from '../blocks/useBlockDnd';
import './PageEditor.css';

/** The main document surface: breadcrumbs + header + the editable block list. */
export function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const {
    page,
    blocks,
    setTitle,
    setIcon,
    setFavorite,
    addBlock,
    editBlock,
    removeBlock,
    removePage,
    moveBlockTo,
    addSubPage,
  } = usePageEditor(id);
  const dnd = useBlockDnd(moveBlockTo);

  const onDelete = async () => {
    await removePage(id);
    history.push('/');
  };

  const onSubPage = async () => history.push(`/page/${await addSubPage()}`);

  return (
    <IonPage>
      <IonContent>
        <div className="pv-page">
          <LoadState
            loading={page.isLoading}
            error={page.isError}
            empty={false}
            onRetry={page.refetch}
          >
            {page.data && (
              <>
                <Breadcrumbs pageId={id} />
                <PageHeader
                  page={page.data}
                  onTitle={setTitle}
                  onIcon={setIcon}
                  onDelete={onDelete}
                  onToggleFavorite={setFavorite}
                />
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
                        onEdit={editBlock}
                        onRemove={removeBlock}
                        onEnter={() => addBlock('text')}
                        dnd={dnd}
                      />
                    ))}
                  </div>
                  <button className="pv-add-block pv-muted" onClick={() => addBlock('text')}>
                    + Add a block
                  </button>
                  <button className="pv-add-block pv-muted" onClick={onSubPage}>
                    + Add a sub-page
                  </button>
                </LoadState>
              </>
            )}
          </LoadState>
        </div>
      </IonContent>
    </IonPage>
  );
}
