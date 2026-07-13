/// <reference path="../pb_data/types.d.ts" />

/**
 * Add the `embed` block type — a video/audio embed for a media URL (stored in
 * the block's `content`). Renders a native <video>/<audio> for direct media
 * files, or an <iframe> for YouTube/Vimeo links. Additive: only extends the
 * type select, so existing blocks stay valid.
 */
const WITH_EMBED = [
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
  'embed',
];

migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_EMBED;
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.getByName('type').values = WITH_EMBED.filter((t) => t !== 'embed');
    app.save(blocks);
  },
);
