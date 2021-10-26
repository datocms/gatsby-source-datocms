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

module.exports = {
  getLoader,
};
