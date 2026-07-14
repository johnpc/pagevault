/// <reference path="../pb_data/types.d.ts" />

/**
 * Add the `subsubheading` block type (H3) — a third heading level below
 * heading (H1) and subheading (H2). Additive: only extends the `type` select's
 * allowed values, so existing blocks stay valid. The `### ` markdown shortcut
 * and slash menu now produce it.
 */
const WITH_H3 = [
  'text',
  'heading',
  'subheading',
  'subsubheading',
  'todo',
  'quote',
  'divider',
  'bullet',
  'numbered',
  'code',
  'image',
  'callout',
  'toggle',
  'table',
  'columns',
  'toc',
  'bookmark',
  'embed',
];

migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_H3;
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_H3.filter((t) => t !== 'subsubheading');
    app.save(blocks);
  },
);
