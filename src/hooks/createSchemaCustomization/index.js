const { pascalize } = require('humps');
const createTypes = require('../sourceNodes/createTypes');
const { prefixId, CODES } = require('../../errorMap');
const CascadedContext = require('../../cascadedContext');

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
    pageSize,
    logApiCalls,
  },
) => {
  const statePerQuery = new WeakMap();
  actions.createResolverContext({
    getQueryContext: key => {
      let queryState = statePerQuery.get(key);
      if (!queryState) {
        queryState = {
          localeState: new CascadedContext({ reporter }),
          fallbackLocalesState: new CascadedContext({ reporter }),
        };
        statePerQuery.set(key, queryState);
      }
      return queryState;
    },
  });

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
    schema,
    store,
    cache,
    generateType: type => {
      return `DatoCms${instancePrefix ? pascalize(instancePrefix) : ''}${type}`;
    },
  };

  if (!process.env.GATSBY_WORKER_ID) {
    let activity;

    activity = reporter.activityTimer(`loading DatoCMS schema`, {
      parentSpan,
    });

    activity.start();

    await loader.load();
    await loader.saveStateToCache(cache);

    activity.end();
  }

  createTypes(context);
};
