/// <reference path="../pb_data/types.d.ts" />

/**
 * Server-authoritative invite flow for collaboration. The invite token is a
 * SECRET: pages are never listable/readable by token via collection rules (that
 * would let anyone enumerate a page from its id), so these two routes are the
 * only way a non-member learns anything about an invited page.
 *
 *   GET  /api/invite/{token}  → minimal landing info (title, icon, role) for a
 *                               live invite link, so the invitee can confirm.
 *   POST /api/join/{token}    → create the caller's membership at the page's
 *                               inviteRole (role is set here, never trusted
 *                               from the client). Idempotent.
 *
 * Both require auth. A revoked link (inviteToken '') 404s. NOTE: each handler
 * runs in its own isolated JSVM runtime, so helpers must be defined INSIDE the
 * handler — top-level functions are not shared into the handler scope.
 */

routerAdd(
  'GET',
  '/api/invite/{token}',
  (e) => {
    const token = e.request.pathValue('token');
    let page = null;
    try {
      page = $app.findFirstRecordByFilter('pages', "inviteToken = {:t} && inviteToken != ''", {
        t: token,
      });
    } catch (_) {
      page = null;
    }
    if (!page) return e.json(404, { message: 'This invite link is no longer active.' });
    return e.json(200, {
      pageId: page.id,
      title: page.getString('title'),
      icon: page.getString('icon'),
      role: page.getString('inviteRole'),
    });
  },
  $apis.requireAuth(),
);

routerAdd(
  'POST',
  '/api/join/{token}',
  (e) => {
    const token = e.request.pathValue('token');
    let page = null;
    try {
      page = $app.findFirstRecordByFilter('pages', "inviteToken = {:t} && inviteToken != ''", {
        t: token,
      });
    } catch (_) {
      page = null;
    }
    if (!page) return e.json(404, { message: 'This invite link is no longer active.' });

    const userId = e.auth.id;
    // Idempotent: reuse an existing membership if the user already joined.
    let share = null;
    try {
      share = $app.findFirstRecordByFilter('shares', 'page = {:p} && user = {:u}', {
        p: page.id,
        u: userId,
      });
    } catch (_) {
      share = null;
    }
    if (!share) {
      const shares = $app.findCollectionByNameOrId('shares');
      share = new Record(shares);
      share.set('page', page.id);
      share.set('user', userId);
      share.set('role', page.getString('inviteRole')); // server sets the role
      $app.save(share);
    }
    return e.json(200, { pageId: page.id, role: share.getString('role') });
  },
  $apis.requireAuth(),
);
