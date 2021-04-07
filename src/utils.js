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
  const { apiToken, apiUrl, environment } = options;
  const key = JSON.stringify({ apiToken, apiUrl, environment });

  if (clients[key]) {
    return clients[key];
  }

  const client = apiUrl
    ? new SiteClient(apiToken, { ...CLIENT_HEADERS, environment }, apiUrl)
    : new SiteClient(apiToken, { ...CLIENT_HEADERS, environment });

  clients[key] = client;

  return client;
}

function getLoader(options) {
  const { apiToken, apiUrl, previewMode, environment } = options;
  const key = JSON.stringify({ apiToken, apiUrl, previewMode, environment });

  if (loaders[key]) {
    return loaders[key];
  }

  const loader = new Loader(
    getClient({ apiToken, apiUrl, environment }),
    (GATSBY_CLOUD && GATSBY_EXECUTING_COMMAND === 'develop') || previewMode,
    environment,
  );

  loaders[key] = loader;

  return loader;
}

module.exports = {
  getClient,
  getLoader,
};
