const fs = require('fs-extra');
const createNodeFromEntity = require('../sourceNodes/createNodeFromEntity');
const destroyEntityNode = require('../sourceNodes/destroyEntityNode');
const createTypes = require('../sourceNodes/createTypes');

const { getLoader } = require('../../utils');

module.exports = async (
  { actions, getNode, getNodesByType, reporter, parentSpan, schema, store },
  {
    apiToken,
    previewMode,
    environment,
    apiUrl,
    localeFallbacks: rawLocaleFallbacks,
  },
) => {
  const localeFallbacks = rawLocaleFallbacks || {};

  const loader = getLoader({ apiToken, previewMode, environment, apiUrl });

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

  const removeUpsertListener = loader.entitiesRepo.addUpsertListener(entity => {
    createNodeFromEntity(entity, context);
  });

  const removeDestroyListener = loader.entitiesRepo.addDestroyListener(
    entity => {
      destroyEntityNode(entity, context);
    },
  );

  await loader.loadSchemaWithinEnvironment();

  removeUpsertListener();
  removeDestroyListener();

  activity.end();

  createTypes(context);
};
