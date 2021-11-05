const { pascalize } = require('humps');
const createTypes = require('../sourceNodes/createTypes');
const { prefixId, CODES } = require('../../errorMap');

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
    cache,
  },
  {
    apiToken,
    previewMode,
    environment,
    apiUrl,
    instancePrefix,
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
    generateType: type => {
      return `DatoCms${instancePrefix ? pascalize(instancePrefix) : ''}${type}`;
    },
  };

  let activity;

  activity = reporter.activityTimer(`loading DatoCMS schema`, {
    parentSpan,
  });

  activity.start();

  if (!process.env.GATSBY_WORKER_ID) {
    await loader.loadSchema();
    await loader.saveStateToCache(cache);
  }

  activity.end();

  createTypes(context);
};
