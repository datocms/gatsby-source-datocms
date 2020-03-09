"use strict";

var _require = require('datocms-client'),
    SiteClient = _require.SiteClient,
    Loader = _require.Loader;

var CLIENT_HEADERS = {
  'X-Reason': 'dump',
  'X-SSG': 'gatsby'
};
var GATSBY_CLOUD = process.env.GATSBY_CLOUD;
var client, loader;

function createClient(_ref) {
  var apiToken = _ref.apiToken,
      apiUrl = _ref.apiUrl;
  return apiUrl ? new SiteClient(apiToken, CLIENT_HEADERS, apiUrl) : new SiteClient(apiToken, CLIENT_HEADERS);
}

function createLoader(_ref2) {
  var apiToken = _ref2.apiToken,
      apiUrl = _ref2.apiUrl,
      previewMode = _ref2.previewMode;

  if (!client) {
    client = createClient({
      apiToken: apiToken,
      apiUrl: apiUrl
    });
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

module.exports = {
  getClient: getClient,
  getLoader: getLoader
};