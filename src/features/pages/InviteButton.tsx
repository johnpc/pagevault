import { useState } from 'react';
import type { PageRecord } from '../../lib/pbClient';
import type { ShareRole } from '../../lib/pbTypes';
import { useSetInvite, useRevokeInvite } from './sharesApi';
import { inviteUrl } from './sharing';
import { usePopover } from '../shell/usePopover';

const ROLES: { role: ShareRole; label: string }[] = [
  { role: 'view', label: 'Can view' },
  { role: 'comment', label: 'Can comment' },
  { role: 'edit', label: 'Can edit' },
];

/** Owner control: open an invite popover, pick a role to create/refresh the
 * page's invite link, copy the /join link, or revoke it. */
export function InviteButton({ page }: { page: PageRecord }) {
  const setInvite = useSetInvite();
  const revoke = useRevokeInvite();
  const { open, setOpen, triggerRef, menuRef, onKeyDown } = usePopover<HTMLUListElement>();
  const [copied, setCopied] = useState(false);

  const pick = async (role: ShareRole) => {
    const updated = await setInvite.mutateAsync({ page, role });
    const url = inviteUrl(window.location.origin, updated.inviteToken);
    await navigator.clipboard?.writeText(url).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pv-invite" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        className="pv-page-delete pv-muted"
        aria-label="Invite collaborators"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {page.inviteToken ? '👥 Invite ✓' : '👥 Invite'}
      </button>
      {open && (
        <ul ref={menuRef} className="pv-invite-menu" role="listbox" aria-label="Invite role">
          {ROLES.map((r) => (
            <li key={r.role}>
              <button
                type="button"
                role="option"
                aria-selected={page.inviteRole === r.role}
                className={`pv-invite-item${page.inviteRole === r.role ? ' pv-invite-item--on' : ''}`}
                onClick={() => pick(r.role)}
              >
                {r.label}
              </button>
            </li>
          ))}
          {page.inviteToken && (
            <li>
              <button
                type="button"
                className="pv-invite-item pv-invite-revoke"
                onClick={() => revoke.mutate(page)}
              >
                Revoke link
              </button>
            </li>
          )}
        </ul>
      )}
      {copied && <span className="pv-invite-copied">Link copied</span>}
    </div>
  );
}
