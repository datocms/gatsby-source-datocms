const { SiteClient, Loader } = require('datocms-client');

const CLIENT_HEADERS = {
  'X-Reason': 'dump',
  'X-SSG': 'gatsby',
};

const loaders = {};

async function getLoader({ cache, loadStateFromCache, ...options }) {
  const {
    apiToken,
    apiUrl,
    environment,
    logApiCalls,
    pageSize,
    previewMode,
  } = options;

  const clientOptions = {
    headers: CLIENT_HEADERS,
  };

  if (options.environment) {
    clientOptions.environment = environment;
  }

  if (options.baseUrl) {
    clientOptions.baseUrl = apiUrl;
  }

  if (options.logApiCalls) {
    clientOptions.logApiCalls = logApiCalls;
  }

  const loaderArgs = [
    [apiToken, clientOptions],
    previewMode,
    environment,
    { pageSize },
  ];

  const key = JSON.stringify(loaderArgs);

  if (loaders[key]) {
    return loaders[key];
  }

  const loader = new Loader(...loaderArgs);

  if (loadStateFromCache) {
    await loader.loadStateFromCache(cache);
  }

  loaders[key] = loader;

  return loader;
}

let nodeManifestWarningWasLogged;

const datocmsCreateNodeManifest = ({ node, context }) => {
  try {
    const { unstable_createNodeManifest } = context.actions;
    const createNodeManifestIsSupported = typeof unstable_createNodeManifest === `function`;
    const updatedAt = node?.entityPayload?.meta?.updated_at;
    const nodeNeedsManifestCreated = updatedAt && node?.locale;

    const shouldCreateNodeManifest = createNodeManifestIsSupported && nodeNeedsManifestCreated;

    if (shouldCreateNodeManifest) {
        
      // Example manifestId: "34324203-2021-07-08T21:52:28.791+01:00"
      const manifestId = `${node.entityPayload.id}-${updatedAt}`;
     
      unstable_createNodeManifest({
        manifestId,
        node,
        updatedAt
      });
    } else if (!createNodeManifestIsSupported && !nodeManifestWarningWasLogged) {
      console.warn(
        `DatoCMS: Your version of Gatsby core doesn't support Content Sync (via the unstable_createNodeManifest action). Please upgrade to the latest version to use Content Sync in your site.`,
      );
      nodeManifestWarningWasLogged = true;
    }
  } catch (e) {
    console.info(`Cannot create node manifest`, e.message);
  }
};

module.exports = {
  getLoader,
  datocmsCreateNodeManifest,
};
