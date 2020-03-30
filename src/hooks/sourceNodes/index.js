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

  if (webhookBody && Object.keys(webhookBody).length) {
    const { entity_id, entity_type, event_type } = webhookBody;
    reporter.info(
      `Received ${event_type} event for ${entity_type} ${entity_id} from DatoCMS`,
    );
    const changesActivity = reporter.activityTimer(
      `loading DatoCMS content changes`,
      {
        parentSpan,
      },
    );
    changesActivity.start();
    switch (entity_type) {
      case 'item':
        if (event_type === 'publish') {
          const payload = await client.items.all(
            {
              'filter[ids]': [entity_id].join(','),
              version: 'published',
            },
            { deserializeResponse: false, allPages: true },
          );
          if (payload) {
            loader.entitiesRepo.upsertEntities(payload);
          }
        } else if (event_type === 'unpublish') {
          loader.entitiesRepo.destroyEntities('item', [entity_id]);
        } else {
          console.log(`Invalid event type ${event_type}`);
        }
        break;

      case 'upload':
        if (event_type === 'create') {
          const payload = await client.uploads.all(
            {
              'filter[ids]': [entity_id].join(','),
              version: 'published',
            },
            { deserializeResponse: false, allPages: true },
          );
          if (payload) {
            loader.entitiesRepo.upsertEntities(payload);
          }
        } else if (event_type === 'delete') {
          loader.entitiesRepo.destroyEntities('upload', [entity_id]);
        } else {
          console.log(`Invalid event type ${event_type}`);
        }
        break;
      default:
        console.log(`Invalid entity type ${entity_type}`);
        break;
    }
    changesActivity.end();
    return;
  }

  loader.entitiesRepo.addUpsertListener(entity => {
    createNodeFromEntity(entity, context);
  });

  loader.entitiesRepo.addDestroyListener(entity => {
    destroyEntityNode(entity, context);
  });

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
