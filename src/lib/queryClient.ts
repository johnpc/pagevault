import { QueryClient, MutationCache } from '@tanstack/react-query';
import { showToast } from '../features/shell/toastBus';

/** App-wide react-query client. Server state (PocketBase data) lives here.
 * A global mutation onError surfaces a toast so a failed save/create/reorder
 * isn't silent — the optimistic update rolls back, and the user is told why. */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
  mutationCache: new MutationCache({
    onError: () => showToast('Couldn’t save your change. Check your connection and try again.'),
  }),
});
