/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('pbc_3945946014');

    // update collection data
    unmarshal(
      {
        updateRule:
          "owner = @request.auth.id || (id ?= @collection.shares.page && @collection.shares.user ?= @request.auth.id && @collection.shares.role ?= 'edit')",
      },
      collection,
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('pbc_3945946014');

    // update collection data
    unmarshal(
      {
        updateRule: 'owner = @request.auth.id',
      },
      collection,
    );

    return app.save(collection);
  },
);
