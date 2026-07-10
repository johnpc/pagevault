import { IonSpinner } from '@ionic/react';
import type { ReactNode } from 'react';
import './LoadState.css';

interface LoadStateProps {
  loading: boolean;
  error: boolean;
  empty: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  children: ReactNode;
}

/**
 * The four outcomes of any data screen, handled uniformly (see CLAUDE.md):
 * loading → spinner, error → retryable message, empty → titled empty state,
 * ready → children. Error takes priority over empty so a failed read never
 * masquerades as "nothing here".
 */
export function LoadState({
  loading,
  error,
  empty,
  onRetry,
  emptyTitle = 'Nothing here yet',
  children,
}: LoadStateProps) {
  if (error) {
    return (
      <div className="pv-loadstate" role="alert">
        <p className="pv-muted">Couldn’t load this. Check your connection and try again.</p>
        {onRetry && (
          <button className="pv-retry" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }
  if (loading) {
    return (
      <div className="pv-loadstate" aria-busy="true">
        <IonSpinner name="crescent" />
      </div>
    );
  }
  if (empty) {
    return (
      <div className="pv-loadstate">
        <p className="pv-heading">{emptyTitle}</p>
      </div>
    );
  }
  return <>{children}</>;
}
