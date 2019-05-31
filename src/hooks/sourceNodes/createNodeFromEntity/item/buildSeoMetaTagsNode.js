const buildNode = require('../utils/buildNode');
const { seoTagsBuilder } = require('datocms-client');

module.exports = function buildSeoMetaTagsNode(
  itemNode,
  itemEntity,
  entitiesRepo,
  i18n,
) {
  return buildNode('DatoCmsSeoMetaTags', itemNode.id, node => {
    node.parent = itemNode.id;
    node.tags = seoTagsBuilder(itemEntity, entitiesRepo, i18n);
  });
};
