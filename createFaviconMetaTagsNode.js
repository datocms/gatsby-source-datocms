'use strict';

var addDigestToNode = require('./addDigestToNode');

var _require = require('datocms-client'),
    faviconTagsBuilder = _require.faviconTagsBuilder;

module.exports = function createFaviconMetaTagsNode(node, site, createNode) {
  var faviconNode = {
    id: node.id + 'FaviconMetaTags',
    parent: node.id,
    children: [],
    tags: faviconTagsBuilder(site),
    internal: {
      type: 'DatoCmsFaviconMetaTags'
    }
  };

  node.children = node.children.concat([faviconNode.id]);
  addDigestToNode(faviconNode);
  createNode(faviconNode);

  return faviconNode.id;
};