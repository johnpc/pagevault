/**
 * Shared PocketBase client — PageVault's single backend seam.
 *
 * PocketBase persists the auth session in localStorage (via its AuthStore), so
 * one long-lived client instance carries the signed-in user across the app.
 * Every server call in the app goes through this client (wrapped in react-query
 * inside `*Api.ts` modules) — never a bare `fetch`.
 *
 * The backend URL is injected at build time via VITE_PB_URL; it defaults to the
 * docker-compose'd instance on localhost:8090 for local dev.
 */
import PocketBase from 'pocketbase';
import type {
  PagesResponse,
  BlocksResponse,
  UsersResponse,
  CommentsResponse,
  SharesResponse,
  PresenceResponse,
} from './pbTypes';

export const PB_URL = import.meta.env.VITE_PB_URL ?? 'http://localhost:8090';

export const pb = new PocketBase(PB_URL);

// Disable PocketBase's per-request-key auto-cancellation. react-query already
// owns request lifecycle + dedup, and PB's cancellation was surfacing as
// unhandled rejections AND could fire a superseded mutation's onError — which
// rolls back a still-valid optimistic update. Letting every request run to
// completion (latest write wins) is correct here and quieter.
pb.autoCancellation(false);

// A signed-in visitor is one whose persisted auth token is still valid.
export const isSignedIn = (): boolean => pb.authStore.isValid;

// The current user's id, or '' when signed out — handy for owner filters.
export const currentUserId = (): string => pb.authStore.record?.id ?? '';

export type PageRecord = PagesResponse;
export type BlockRecord = BlocksResponse;
export type UserRecord = UsersResponse;
export type CommentRecord = CommentsResponse;
export type ShareRecord = SharesResponse;
export type PresenceRecord = PresenceResponse;
