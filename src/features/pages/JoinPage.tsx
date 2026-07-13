import { useHistory, useParams } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { LoadState } from '../shell/LoadState';
import { useInvitedPage, useJoinPage } from './sharesApi';
import './JoinPage.css';

const ROLE_LABEL = { view: 'view', comment: 'comment on', edit: 'edit' } as const;

/** Landing screen for an invite link (/join/:token). A signed-in user sees the
 * page they've been invited to and the role it grants, then joins — which
 * creates their membership server-side and navigates into the now-accessible
 * page. The invite info comes from the server hook (the token is a secret). */
export function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const history = useHistory();
  const invited = useInvitedPage(token);
  const join = useJoinPage();
  const preview = invited.data;

  const onJoin = async () => {
    const result = await join.mutateAsync(token);
    history.replace(`/page/${result.pageId}`);
  };

  return (
    <IonPage>
      <IonContent>
        <div className="pv-join">
          <LoadState
            loading={invited.isLoading}
            error={invited.isError}
            empty={!invited.isLoading && !preview}
            emptyTitle="This invite link is no longer active."
            onRetry={invited.refetch}
          >
            {preview && (
              <div className="pv-join-card">
                <p className="pv-join-eyebrow">You've been invited to</p>
                <h1 className="pv-join-title">
                  {preview.icon && <span aria-hidden="true">{preview.icon} </span>}
                  {preview.title || 'Untitled'}
                </h1>
                <p className="pv-join-role">
                  You'll be able to <strong>{ROLE_LABEL[preview.role]}</strong> this page.
                </p>
                <button className="pv-join-btn" onClick={onJoin} disabled={join.isPending}>
                  {join.isPending ? 'Joining…' : 'Join page'}
                </button>
              </div>
            )}
          </LoadState>
        </div>
      </IonContent>
    </IonPage>
  );
}
