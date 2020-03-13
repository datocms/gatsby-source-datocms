const fs = require('fs-extra');
const finalizeNodesCreation = require('../sourceNodes/finalizeNodesCreation');
const createTypes = require('../sourceNodes/createTypes');

const { getClient, getLoader } = require('../../utils');

module.exports = async (
  { actions, getNode, getNodesByType, reporter, parentSpan, schema, store },
  { apiToken, previewMode, apiUrl, localeFallbacks: rawLocaleFallbacks },
) => {
  const localeFallbacks = rawLocaleFallbacks || {};

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

  let activity;

  activity = reporter.activityTimer(`loading DatoCMS schema`, {
    parentSpan,
  });

  activity.start();

  await loader.loadSchema();
  finalizeNodesCreation(context);

  activity.end();

  createTypes(context);
};
