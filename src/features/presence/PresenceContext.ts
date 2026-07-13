import { createContext } from 'react';
import type { Viewer, ViewerAt } from './activeViewers';

/** Shared live-presence state for the open page. A SINGLE provider owns the
 * heartbeat loop (so a user writes one row, not one per consumer) and exposes
 * both the avatar list and the per-block cursor map, plus a setter the editor
 * calls when focus moves to a block. */
export interface PresenceState {
  viewers: Viewer[];
  cursors: Record<string, ViewerAt[]>;
  setFocusedBlock: (blockId: string) => void;
}

const EMPTY: PresenceState = {
  viewers: [],
  cursors: {},
  setFocusedBlock: () => {},
};

export const PresenceContext = createContext<PresenceState>(EMPTY);
