const addDigestToNode = require('./addDigestToNode');
const seoTagsBuilder = require('datocms-client/lib/utils/seoTagsBuilder').default;

module.exports = function createSeoMetaTagsNode(node, item, site, createNode) {
  const seoNode = {
    id: `${node.id}SeoMetaTags`,
    parent: node.id,
    children: [],
    tags: seoTagsBuilder(item, site),
    internal: {
      type: `DatoCmsSeoMetaTags`
    }
  };

  node.children = node.children.concat([seoNode.id]);
  addDigestToNode(seoNode);
  createNode(seoNode);

  return seoNode.id;
};