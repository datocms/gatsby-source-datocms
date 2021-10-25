const fs = require('fs-extra');
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

  console.log('====== CREO TIPI =======');

  const loader = getLoader({
    cache,
    apiToken,
    previewMode,
    environment,
    apiUrl,
    pageSize,
    logApiCalls,
    loadStateFromCache: !!process.env.GATSBY_WORKER_ID,
  });

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
  }

  activity.end();

  createTypes(context);
};
