const { SiteClient, Loader } = require('datocms-client');

const CLIENT_HEADERS = {
  'X-Reason': 'dump',
  'X-SSG': 'gatsby',
};

const GATSBY_CLOUD = process.env.GATSBY_CLOUD;
const GATSBY_EXECUTING_COMMAND = process.env.gatsby_executing_command;

let client, loader;

function createClient({ apiToken, apiUrl, environment }) {
  return apiUrl
    ? new SiteClient(apiToken, { ...CLIENT_HEADERS, environment }, apiUrl)
    : new SiteClient(apiToken, { ...CLIENT_HEADERS, environment });
}

function createLoader({ apiToken, apiUrl, previewMode, environment }) {
  if (!client) {
    client = createClient({ apiToken, apiUrl, environment });
  }
  return new Loader(
    client,
    (GATSBY_CLOUD && GATSBY_EXECUTING_COMMAND === 'develop') || previewMode,
  );
}

function getLoader(options) {
  if (!loader) {
    loader = createLoader(options);
  }
  return loader;
}

function getClient(options) {
  if (!client) {
    client = createClient(options);
  }
  return client;
}

module.exports = {
  getClient,
  getLoader,
};
