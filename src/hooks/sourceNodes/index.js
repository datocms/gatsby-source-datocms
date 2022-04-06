const createNodeFromEntity = require('./createNodeFromEntity');
const destroyEntityNode = require('./destroyEntityNode');
const { prefixId, CODES } = require('../../errorMap');
const Queue = require('promise-queue');
const { pascalize } = require('humps');
const uniq = require('lodash.uniq');
const visit = require('unist-util-visit');
const {
  isInlineItem,
  isItemLink,
  isBlock,
} = require('datocms-structured-text-utils');

const { getLoader } = require('../../utils');

const findAll = (document, predicate) => {
  const result = [];

  visit(document, predicate, node => {
    result.push(node);
  });

  return result;
};

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
    localeFallbacks: rawLocaleFallbacks,
    localesToGenerate,
    pageSize,
    logApiCalls,
  },
) => {
  const localeFallbacks = rawLocaleFallbacks || {};

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
    localeFallbacks,
    localesToGenerate,
    schema,
    store,
    cache,
    previewMode,
    generateType: type =>
      `DatoCms${instancePrefix ? pascalize(instancePrefix) : ''}${type}`,
  };

  if (webhookBody && Object.keys(webhookBody).length) {
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

    switch (entityType) {
      case 'item':
        if (
          eventType === 'publish' ||
          eventType === `update` ||
          eventType === 'create'
        ) {
          const payload = await loader.client.items.find(
            entityId,
            {
              version: previewMode ? 'current' : 'published',
              include: 'nested_items',
            },
            { deserializeResponse: false },
          );
          loader.entitiesRepo.upsertEntities(payload);
        } else if (eventType === 'unpublish' || eventType === 'delete') {
          loader.entitiesRepo.destroyEntities('item', [entityId]);
        } else {
          reporter.warn(`Invalid event type ${eventType}`);
        }
        break;

      case 'upload':
        if (eventType === 'create' || eventType === `update`) {
          const payload = await loader.client.uploads.find(
            entityId,
            {},
            { deserializeResponse: false },
          );
          loader.entitiesRepo.upsertEntities(payload);
        } else if (eventType === 'delete') {
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
  }

  Object.keys(loader.entitiesRepo.entities).forEach(entityType => {
    loader.entitiesRepo.findEntitiesOfType(entityType).forEach(entity => {
      createNodeFromEntity(entity, context);
    });
  });

  const queue = new Queue(1, Infinity);

  if (process.env.NODE_ENV !== `production` && !disableLiveReload) {
    loader.entitiesRepo.addUpsertListener(entity => {
      createNodeFromEntity(entity, context);
    });

    loader.entitiesRepo.addDestroyListener(entity => {
      destroyEntityNode(entity, context);
    });

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
};
