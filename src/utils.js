const { SiteClient, Loader } = require('datocms-client');

const CLIENT_HEADERS = {
  'X-Reason': 'dump',
  'X-SSG': 'gatsby',
};

const GATSBY_CLOUD = process.env.GATSBY_CLOUD;
const GATSBY_EXECUTING_COMMAND = process.env.gatsby_executing_command;

const clients = {};
const loaders = {};

function getClient(options) {
  const { apiToken, apiUrl, environment, logApiCalls } = options;
  const key = JSON.stringify({ apiToken, apiUrl, environment, logApiCalls });

  if (clients[key]) {
    return clients[key];
  }

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

  const client = new SiteClient(apiToken, clientOptions);

  clients[key] = client;

  return client;
}

function getLoader(options) {
  const {
    apiToken,
    apiUrl,
    previewMode,
    environment,
    pageSize,
    logApiCalls,
  } = options;
  const key = JSON.stringify({
    apiToken,
    apiUrl,
    previewMode,
    environment,
    pageSize,
    logApiCalls,
  });

  if (loaders[key]) {
    return loaders[key];
  }

  const loader = new Loader(
    getClient({ apiToken, apiUrl, environment, logApiCalls }),
    (GATSBY_CLOUD && GATSBY_EXECUTING_COMMAND === 'develop') || previewMode,
    environment,
    { pageSize },
  );

  loaders[key] = loader;

  return loader;
}

module.exports = {
  getClient,
  getLoader,
};
