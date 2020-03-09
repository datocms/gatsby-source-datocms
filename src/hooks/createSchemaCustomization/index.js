const fs = require('fs-extra');
const { SiteClient, Loader } = require('datocms-client');
const finalizeNodesCreation = require('../sourceNodes/finalizeNodesCreation');
const createTypes = require('../sourceNodes/createTypes');

const CLIENT_HEADERS = {
  'X-Reason': 'dump',
  'X-SSG': 'gatsby',
};

module.exports = async (
  { actions, getNode, getNodesByType, reporter, parentSpan, schema, store },
  { apiToken, previewMode, apiUrl, localeFallbacks: rawLocaleFallbacks },
) => {
  let client = apiUrl
    ? new SiteClient(apiToken, CLIENT_HEADERS, apiUrl)
    : new SiteClient(apiToken, CLIENT_HEADERS);

  const localeFallbacks = rawLocaleFallbacks || {};

  const loader = new Loader(client, process.env.GATSBY_CLOUD || previewMode);

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
