/// <reference path="../pb_data/types.d.ts" />

/**
 * Add a `file` upload field to blocks so an image block can hold an uploaded
 * file (not just a remote URL). Single file, image mime types, ~10MB cap. Left
 * unprotected so a public page's images load over the /shared link the same way
 * the link itself grants access (consistent with the existing sharing model).
 * Additive + non-required, so existing blocks stay valid.
 */
migrate(
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.add(
      new FileField({
        name: 'file',
        required: false,
        maxSelect: 1,
        maxSize: 10485760,
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      }),
    );
    app.save(blocks);
  },
  (app) => {
    const blocks = app.findCollectionByNameOrId('blocks');
    blocks.fields.removeByName('file');
    app.save(blocks);
  },
);
