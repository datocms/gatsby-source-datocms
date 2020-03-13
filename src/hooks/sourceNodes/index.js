const fs = require('fs-extra');
const createNodeFromEntity = require('./createNodeFromEntity');
const destroyEntityNode = require('./destroyEntityNode');
const finalizeNodesCreation = require('./finalizeNodesCreation');
const Queue = require('promise-queue');

const { getClient, getLoader } = require('../../utils');

module.exports = async (
  {
    actions,
    getNode,
    getNodesByType,
    reporter,
    parentSpan,
    schema,
    store,
    webhookBody,
  },
  {
    apiToken,
    disableLiveReload,
    previewMode,
    apiUrl,
    localeFallbacks: rawLocaleFallbacks,
  },
) => {
  const localeFallbacks = rawLocaleFallbacks || {};

  const client = getClient({ apiToken, previewMode, apiUrl });
  const loader = getLoader({ apiToken, previewMode, apiUrl });

  const program = store.getState().program;
  const cacheDir = `${program.directory}/.cache/datocms-assets`;

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }

  const context = {
    entitiesRepo: loader.entitiesRepo,
    actions,
    getNode,
    getNodesByType,
    localeFallbacks,
    schema,
    store,
    cacheDir,
  };

  loader.entitiesRepo.addUpsertListener(entity => {
    createNodeFromEntity(entity, context);
  });

  loader.entitiesRepo.addDestroyListener(entity => {
    destroyEntityNode(entity, context);
  });

  if (webhookBody) {
    const { entity_id, entity_type, event_type } = webhookBody;
    if (event_type) {
      const changesActivity = reporter.activityTimer(
        `loading DatoCMS content changes`,
        {
          parentSpan,
        },
      );
      if (event_type === `update`) {
        changesActivity.start();
        const payload = await client.items.all(
          {
            'filter[ids]': [entity_id].join(','),
            version: 'published',
          },
          { deserializeResponse: false, allPages: true },
        );
        loader.entitiesRepo.upsertEntities(payload);
        changesActivity.end();
      }
      return;
    }
  }

  let activity;

  activity = reporter.activityTimer(`loading DatoCMS content`, { parentSpan });

  activity.start();
  await loader.load();
  finalizeNodesCreation(context);

  activity.end();

  const queue = new Queue(1, Infinity);

  if (process.env.NODE_ENV !== `production` && !disableLiveReload) {
    loader.watch(loadPromise => {
      queue.add(async () => {
        const activity = reporter.activityTimer(
          `detected change in DatoCMS content, loading new data`,
          { parentSpan },
        );
        activity.start();

        await loadPromise;

        finalizeNodesCreation(context);
        activity.end();
      });
    });
  }
};
