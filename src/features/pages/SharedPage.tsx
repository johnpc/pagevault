import { IonContent, IonPage } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { usePublicPage, usePublicBlocks } from './sharingApi';
import { displayTitle } from './pageTree';
import { coverGradient } from './covers';
import { FormattedText } from '../blocks/FormattedText';
import { LoadState } from '../shell/LoadState';
import './SharedPage.css';

/** Read-only public view of a shared page, reached at /shared/:token with NO
 * auth. Renders the title, cover, and blocks; no editing controls. */
export function SharedPage() {
  const { token } = useParams<{ token: string }>();
  const page = usePublicPage(token);
  const blocks = usePublicBlocks(page.data?.id);
  const gradient = page.data ? coverGradient(page.data.cover) : null;

  return (
    <IonPage>
      <IonContent>
        <div className="pv-shared">
          <LoadState
            loading={page.isLoading}
            error={page.isError}
            empty={!page.isLoading && !page.data}
            onRetry={page.refetch}
            emptyTitle="This page isn’t shared"
          >
            {page.data && (
              <article className="pv-shared-doc">
                {gradient && <div className="pv-cover-strip" style={{ background: gradient }} />}
                <h1 className="pv-shared-title">
                  {page.data.icon && <span>{page.data.icon} </span>}
                  {displayTitle(page.data)}
                </h1>
                {(blocks.data ?? []).map((b) => (
                  <div key={b.id} className={`pv-block pv-block--${b.type}`}>
                    {b.type === 'divider' ? <hr /> : <FormattedText text={b.content} />}
                  </div>
                ))}
                <footer className="pv-shared-foot pv-muted">Shared with PageVault</footer>
              </article>
            )}
          </LoadState>
        </div>
      </IonContent>
    </IonPage>
  );
}
