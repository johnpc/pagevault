import { useHistory, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { usePageEditor } from './usePageEditor';
import { LoadState } from '../shell/LoadState';
import { PageHeader } from './PageHeader';
import { BlockRow } from '../blocks/BlockRow';
import { useBlockDnd } from '../blocks/useBlockDnd';
import './PageEditor.css';

/** The main document surface: header (icon + title) + the editable block list. */
export function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const {
    page,
    blocks,
    setTitle,
    setIcon,
    addBlock,
    editBlock,
    removeBlock,
    removePage,
    moveBlockTo,
  } = usePageEditor(id);
  const dnd = useBlockDnd(moveBlockTo);

  const onDelete = async () => {
    await removePage(id);
    history.push('/');
  };

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
                <PageHeader
                  page={page.data}
                  onTitle={setTitle}
                  onIcon={setIcon}
                  onDelete={onDelete}
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
                </LoadState>
              </>
            )}
          </LoadState>
        </div>
      </IonContent>
    </IonPage>
  );
}
