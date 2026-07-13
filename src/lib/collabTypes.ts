/**
 * Collaboration record shapes (memberships + presence), split out of pbTypes so
 * each file stays small. Imported back into the pbTypes barrel + re-exported, so
 * callers keep importing collaboration types from one place.
 */
import type { BaseRecord, UsersResponse } from './pbTypes';

/** A collaborator's permission on a shared page (ascending capability). */
export type ShareRole = 'view' | 'comment' | 'edit';

/** One membership: a user has joined a page at a role via its invite link. */
export interface SharesResponse extends BaseRecord {
  page: string;
  user: string;
  role: ShareRole;
}

/** A viewer's presence heartbeat on a page. `updated` (from BaseRecord) is the
 * last heartbeat; a viewer is "active" while it stays recent. `expand.user`
 * carries the viewer's name/email for the avatar when requested. */
export interface PresenceResponse extends BaseRecord {
  page: string;
  user: string;
  block: string; // id of the block this viewer is focused in; '' = none
  expand?: { user?: UsersResponse };
}
