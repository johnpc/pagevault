/// <reference path="../pb_data/types.d.ts" />

/**
 * Add the `bookmark` block type — a link card for a URL (stored in the block's
 * `content`). Rendered as a titled card showing the link's domain + full URL.
 * Additive: only extends the type select, so existing blocks stay valid.
 */
const WITH_BOOKMARK = [
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
  'bookmark',
];

migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_BOOKMARK;
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_BOOKMARK.filter((t) => t !== 'bookmark');
    app.save(blocks);
  },
);
