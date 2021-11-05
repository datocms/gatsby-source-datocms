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
    loadStateFromCache: !!process.env.GATSBY_WORKER_ID,
  });

  const context = {
    entitiesRepo: loader.entitiesRepo,
    actions,
    getNode,
    getNodesByType,
    localeFallbacks,
    schema,
    store,
    cache,
    previewMode,
    generateType: type =>
      `DatoCms${instancePrefix ? pascalize(instancePrefix) : ''}${type}`,
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
        if (
          event_type === 'publish' ||
          event_type === `update` ||
          event_type === 'create'
        ) {
          const payload = await loader.client.items.all(
            {
              'filter[ids]': [entity_id].join(','),
              version: previewMode ? 'draft' : 'published',
            },
            { deserializeResponse: false, allPages: true },
          );
          if (payload) {
            // `rich_text`, `links`, `link` fields link to other entities and we need to
            // fetch them separately to make sure we have all the data
            const linkedEntitiesIdsToFetch = payload.data.reduce(
              (collectedIds, payload) => {
                const item_type_rel = payload.relationships.item_type.data;
                const itemTypeForThis = loader.entitiesRepo.findEntity(
                  item_type_rel.type,
                  item_type_rel.id,
                );
                const fieldsToResolve = itemTypeForThis.fields.filter(
                  fieldDef =>
                    [`rich_text`, `links`, `link`, `structured_text`].includes(
                      fieldDef.fieldType,
                    ),
                );

                function addRawValueToCollectedIds(fieldInfo, fieldRawValue) {
                  if (
                    ['links', 'rich_text'].includes(fieldInfo.fieldType) &&
                    Array.isArray(fieldRawValue)
                  ) {
                    fieldRawValue.forEach(collectedIds.add.bind(collectedIds));
                  } else if (fieldInfo.fieldType === 'link' && fieldRawValue) {
                    collectedIds.add(fieldRawValue);
                  } else if (
                    fieldInfo.fieldType === 'structured_text' &&
                    fieldRawValue
                  ) {
                    uniq(
                      findAll(fieldRawValue.document, [
                        isInlineItem,
                        isItemLink,
                        isBlock,
                      ]).map(node => node.item),
                    ).forEach(collectedIds.add.bind(collectedIds));
                  }
                }

                fieldsToResolve.forEach(fieldInfo => {
                  const fieldRawValue = payload.attributes[fieldInfo.apiKey];
                  if (fieldInfo.localized) {
                    // Localized fields raw values are object with lang codes
                    // as keys. We need to iterate over properties to
                    // collect ids from all languages
                    Object.values(fieldRawValue).forEach(
                      fieldTranslationRawValue => {
                        addRawValueToCollectedIds(
                          fieldInfo,
                          fieldTranslationRawValue,
                        );
                      },
                    );
                  } else {
                    addRawValueToCollectedIds(fieldInfo, fieldRawValue);
                  }
                });

                return collectedIds;
              },
              new Set(),
            );

            const linkedEntitiesPayload = await loader.client.items.all(
              {
                'filter[ids]': Array.from(linkedEntitiesIdsToFetch).join(','),
                version: previewMode ? 'draft' : 'published',
              },
              {
                deserializeResponse: false,
                allPages: true,
              },
            );

            // attach included portion of payload
            payload.included = linkedEntitiesPayload.data;

            loader.entitiesRepo.upsertEntities(payload);
          }
        } else if (event_type === 'unpublish' || event_type === 'delete') {
          loader.entitiesRepo.destroyEntities('item', [entity_id]);
        } else {
          reporter.warn(`Invalid event type ${event_type}`);
        }
        break;

      case 'upload':
        if (event_type === 'create' || event_type === `update`) {
          const payload = await loader.client.uploads.all(
            {
              'filter[ids]': [entity_id].join(','),
              version: previewMode ? 'draft' : 'published',
            },
            { deserializeResponse: false, allPages: true },
          );
          if (payload) {
            loader.entitiesRepo.upsertEntities(payload);
          }
        } else if (event_type === 'delete') {
          loader.entitiesRepo.destroyEntities('upload', [entity_id]);
        } else {
          reporter.warn(`Invalid event type ${event_type}`);
        }
        break;
      default:
        reporter.warn(`Invalid entity type ${entity_type}`);
        break;
    }
    changesActivity.end();
    return;
  }

  let activity = reporter.activityTimer(`loading DatoCMS content`, {
    parentSpan,
  });
  activity.start();

  loader.entitiesRepo.addUpsertListener(entity => {
    createNodeFromEntity(entity, context);
  });

  loader.entitiesRepo.addDestroyListener(entity => {
    destroyEntityNode(entity, context);
  });

  if (!process.env.GATSBY_WORKER_ID) {
    await loader.load();
    await loader.saveStateToCache(cache);
  }

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

        activity.end();
      });
    });
  }
};
