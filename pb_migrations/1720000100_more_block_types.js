/// <reference path="../pb_data/types.d.ts" />

/**
 * Extend the block `type` select with list + code variants so the editor can
 * support markdown shortcuts (`- ` → bullet, `1. ` → numbered, ``` → code).
 * Additive: the existing values are preserved, so already-stored blocks stay
 * valid. Applied on boot after the initial schema.
 */
const ALL_TYPES = [
  'text',
  'heading',
  'subheading',
  'todo',
  'quote',
  'divider',
  'bullet',
  'numbered',
  'code',
];

migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = ALL_TYPES;
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = [
      'text',
      'heading',
      'subheading',
      'todo',
      'quote',
      'divider',
    ];
    app.save(blocks);
  },
);
