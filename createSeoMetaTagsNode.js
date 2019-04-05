'use strict';

var addDigestToNode = require('./addDigestToNode');

var _require = require('datocms-client'),
    seoTagsBuilder = _require.seoTagsBuilder;

module.exports = function createSeoMetaTagsNode(node, item, site, createNode) {
  var seoNode = {
    id: node.id + 'SeoMetaTags',
    parent: node.id,
    children: [],
    tags: seoTagsBuilder(item, site),
    internal: {
      type: 'DatoCmsSeoMetaTags'
    }
  };

  node.children = node.children.concat([seoNode.id]);
  addDigestToNode(seoNode);
  createNode(seoNode);

  return seoNode.id;
};