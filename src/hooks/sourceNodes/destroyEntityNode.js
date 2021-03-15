const { pascalize } = require('humps');
const { version: gatsbyVersion } = require(`gatsby/package.json`);

const gatsbyVersion2 = gatsbyVersion.split('.')[0] === '2';

const ENTITY_TO_NODE_IDS = {
  item_type: (entity, { generateType }) => generateType(`Model-${entity.id}`),
  field: (entity, { generateType }) => generateType(`Field-${entity.id}`),
  upload: (entity, { generateType }) => generateType(`Asset-${entity.id}`),
  item: (entity, { entitiesRepo, generateType }) => {
    const siteEntity = entitiesRepo.findEntitiesOfType('site')[0];
    const type = pascalize(entity.itemType.apiKey);
    return siteEntity.locales.map(locale =>
      generateType(`${type}-${entity.id}-${locale}`),
    );
  },
  site: (entity, { generateType }) => {
    return entity.locales.map(locale =>
      generateType(`Site-${entity.id}-${locale}`),
    );
  },
};

module.exports = (entity, context) => {
  if (!ENTITY_TO_NODE_IDS[entity.type]) {
    console.log(`Don't know how to delete entity of type '${entity.type}'!`);
    return;
  }

  const result = ENTITY_TO_NODE_IDS[entity.type](entity, context);
  const nodeIdsToDelete = Array.isArray(result) ? result : [result];

  nodeIdsToDelete.map(nodeId => {
    const node = context.getNode(nodeId);
    if (node) {
      context.actions.deleteNode(gatsbyVersion2 ? { node } : node);
    }
  });
};
