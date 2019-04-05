'use strict';

var _require = require('datocms-client'),
    Site = _require.Site,
    i18n = _require.i18n;

var initNodeFromEntity = require('./initNodeFromEntity');
var addDigestToNode = require('./addDigestToNode');
var addEntityAttributes = require('./addEntityAttributes');
var createFaviconMetaTagsNode = require('./createFaviconMetaTagsNode');
var objectAssign = require('object-assign');

module.exports = function (repo, itemsRepo, createNode) {
  var siteEntity = repo.findEntitiesOfType('site')[0];
  var site = new Site(siteEntity, itemsRepo);

  i18n.availableLocales = site.locales;

  site.locales.forEach(function (locale) {
    i18n.locale = locale;

    var node = initNodeFromEntity(siteEntity, locale);

    node = objectAssign(site.toMap(), node);

    delete node.favicon;
    delete node.faviconMetaTags;

    if (site.favicon) {
      node.faviconMetaTags___NODE = createFaviconMetaTagsNode(node, site, createNode);
    }

    node.locale = locale;

    addDigestToNode(node);
    createNode(node);
  });
};