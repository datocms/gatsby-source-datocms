const fs = require('fs-extra');
const { SiteClient, Loader } = require('datocms-client');
const createNodeFromEntity = require('./createNodeFromEntity');
const destroyEntityNode = require('./destroyEntityNode');
const finalizeNodesCreation = require('./finalizeNodesCreation');
const Queue = require('promise-queue');

const CLIENT_HEADERS = {
  'X-Reason': 'dump',
  'X-SSG': 'gatsby',
};

module.exports = async (
  { actions, getNode, getNodesByType, reporter, parentSpan, schema, store },
  {
    apiToken,
    disableLiveReload,
    previewMode,
    apiUrl,
    localeFallbacks: rawLocaleFallbacks,
  },
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

  loader.entitiesRepo.addUpsertListener(entity => {
    createNodeFromEntity(entity, context);
  });

  loader.entitiesRepo.addDestroyListener(entity => {
    destroyEntityNode(entity, context);
  });

  let activity;

  activity = reporter.activityTimer(`loading DatoCMS content`, { parentSpan });

  activity.start();
  await loader.load();
  finalizeNodesCreation(context);

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

        finalizeNodesCreation(context);
        activity.end();
      });
    });
  }
};
