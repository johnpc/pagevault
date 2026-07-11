/// <reference path="../pb_data/types.d.ts" />

/**
 * Add the `toc` block type — a table of contents derived from the page's own
 * heading blocks (no stored payload; it reads the page's blocks at render).
 * Additive: only extends the type select, so existing blocks stay valid.
 */
const WITH_TOC = [
  'text',
  'heading',
  'subheading',
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
];

migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_TOC;
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_TOC.filter((t) => t !== 'toc');
    app.save(blocks);
  },
);
