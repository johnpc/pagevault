/// <reference path="../pb_data/types.d.ts" />

/**
 * Live cursors, block-level: add a `block` field to a presence heartbeat row —
 * the id of the block the viewer is currently focused in ('' = not on a
 * specific block). Other viewers render a colored name-tag on that block, so you
 * see where each collaborator is working. Additive + non-required; the rules and
 * unique (page,user) index from the presence collection are unchanged.
 */
migrate(
  (app) => {
    const presence = app.findCollectionByNameOrId('presence');
    presence.fields.add(new TextField({ name: 'block', required: false, max: 50 }));
    app.save(presence);
  },
  (app) => {
    const presence = app.findCollectionByNameOrId('presence');
    presence.fields.removeByName('block');
    app.save(presence);
  },
);
