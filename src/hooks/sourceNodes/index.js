const createNodeFromEntity = require('./createNodeFromEntity');
const destroyEntityNode = require('./destroyEntityNode');
const { prefixId, CODES } = require('../../errorMap');
const Queue = require('promise-queue');
const { pascalize } = require('humps');

const { getLoader } = require('../../utils');

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
    cache,
  },
  {
    apiToken,
    environment,
    disableLiveReload,
    previewMode,
    instancePrefix,
    apiUrl,
    pageSize,
    logApiCalls,
  },
) => {
  if (!apiToken) {
    const errorText = `API token must be provided!`;
    reporter.panic(
      {
        id: prefixId(CODES.MissingAPIToken),
        context: { sourceMessage: errorText },
      },
      new Error(errorText),
    );
  }

  const loader = await getLoader({
    cache,
    apiToken,
    previewMode,
    environment,
    apiUrl,
    pageSize,
    logApiCalls,
    // we assume that whenever `sourceNodes` is called, `createSchemaCustomization` has
    // already been called, so we can simply load from cache
    loadStateFromCache: true,
  });

  const context = {
    entitiesRepo: loader.entitiesRepo,
    actions,
    getNode,
    getNodesByType,
    schema,
    store,
    cache,
    previewMode,
    generateType: type =>
      `DatoCms${instancePrefix ? pascalize(instancePrefix) : ''}${type}`,
  };

  // we need this both for Gatsby CMS Preview and live reload on local development

  loader.entitiesRepo.addUpsertListener(entity => {
    createNodeFromEntity(entity, context);
  });

  loader.entitiesRepo.addDestroyListener(entity => {
    destroyEntityNode(entity, context);
  });

  const isWebhook = webhookBody && Object.keys(webhookBody).length > 0;

  if (isWebhook) {
    const {
      entity_id: entityId,
      entity_type: entityType,
      event_type: eventType,
    } = webhookBody;

    reporter.info(
      `Received ${eventType} event for ${entityType} ${entityId} from DatoCMS`,
    );

    const changesActivity = reporter.activityTimer(
      `loading DatoCMS content changes`,
      {
        parentSpan,
      },
    );

    changesActivity.start();

    try {
      switch (entityType) {
        case 'item':
          if (['publish', 'update', 'create'].includes(eventType)) {
            const payload = await loader.client.items.find(
              entityId,
              {
                version: previewMode ? 'current' : 'published',
                include: 'nested_items',
              },
              { deserializeResponse: false },
            );
            loader.entitiesRepo.upsertEntities(payload);
          } else if (['unpublish', 'delete'].includes(eventType)) {
            loader.entitiesRepo.destroyEntities('item', [entityId]);
          } else {
            reporter.warn(`Invalid event type ${eventType}`);
          }
          break;

        case 'upload':
          if (['create', 'update'].includes(eventType)) {
            const payload = await loader.client.uploads.find(
              entityId,
              {},
              { deserializeResponse: false },
            );
            loader.entitiesRepo.upsertEntities(payload);
          } else if (['delete'].includes(eventType)) {
            loader.entitiesRepo.destroyEntities('upload', [entityId]);
          } else {
            reporter.warn(`Invalid event type ${eventType}`);
          }
          break;
        default:
          reporter.warn(`Invalid entity type ${entityType}`);
          break;
      }
      changesActivity.end();
      return;
    } catch (err) {
      if (instancePrefix) {
        reporter.info(
          `Could not find ${entityType} ${entityId} in ${instancePrefix}. The item might belong to another DatoCMS instance.`,
        );
      } else {
        reporter.panicBuild(err);
      }
    }

    Object.keys(loader.entitiesRepo.entities).forEach(entityType => {
      loader.entitiesRepo.findEntitiesOfType(entityType).forEach(entity => {
        createNodeFromEntity(entity, context);
      });
    });

    if (process.env.NODE_ENV !== `production` && !disableLiveReload) {
      const queue = new Queue(1, Infinity);

      loader.watch(loadPromise => {
        queue.add(async () => {
          const activity = reporter.activityTimer(
            `detected change in DatoCMS content, loading new data`,
            { parentSpan },
          );
          activity.start();

          await loadPromise;

          activity.end();
        });
      });
    }
  }
};
