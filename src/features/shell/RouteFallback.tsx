import { IonSpinner } from '@ionic/react';
import './LoadState.css';

/** The Suspense fallback shown while a lazily-loaded route chunk downloads.
 * Mirrors LoadState's loading branch so a route swap looks consistent. */
export function RouteFallback() {
  return (
    <div className="pv-loadstate" aria-busy="true">
      <IonSpinner name="crescent" />
    </div>
  );
}
