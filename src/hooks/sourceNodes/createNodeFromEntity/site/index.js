const buildNode = require('../utils/buildNode');
const { faviconTagsBuilder } = require('datocms-client');

module.exports = function buildSiteNode(
  entity,
  { entitiesRepo, generateType },
) {
  const siteNode = buildNode(generateType('Site'), entity.id, node => {
    node.entityPayload = entity.payload;
    node.faviconMetaTags = faviconTagsBuilder(entitiesRepo);
  });

  return [siteNode];
};
