const fs = require('fs-extra');
const { pascalize } = require('humps');
const createTypes = require('../sourceNodes/createTypes');
const { prefixId, CODES } = require('../../errorMap');

const { getLoader } = require('../../utils');

module.exports = async (
  { actions, getNode, getNodesByType, reporter, parentSpan, schema, store },
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

  if (process.env.GATSBY_IS_PREVIEW === `true`) {
    previewMode = true;
  }

  const loader = getLoader({
    apiToken,
    previewMode,
    environment,
    apiUrl,
    pageSize,
    logApiCalls,
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

  await loader.loadSchemaWithinEnvironment();

  activity.end();

  createTypes(context);
};
