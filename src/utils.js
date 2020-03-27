const { SiteClient, Loader } = require('datocms-client');

const CLIENT_HEADERS = {
  'X-Reason': 'dump',
  'X-SSG': 'gatsby',
};

const GATSBY_CLOUD = process.env.GATSBY_CLOUD;

let client, loader;

function createClient({ apiToken, apiUrl }) {
  return apiUrl
    ? new SiteClient(apiToken, CLIENT_HEADERS, apiUrl)
    : new SiteClient(apiToken, CLIENT_HEADERS);
}

function createLoader({ apiToken, apiUrl, previewMode }) {
  if (!client) {
    client = createClient({ apiToken, apiUrl });
  }
  return new Loader(client, GATSBY_CLOUD || previewMode);
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

async function getEntity(items, id, version) {
  try {
    const result = await items.find(id, {
      version,
    });
    return result;
  } catch (err) {
    console.log('Error loading entity', err);
    return undefined;
  }
}

module.exports = {
  getClient,
  getLoader,
  getEntity,
};
  