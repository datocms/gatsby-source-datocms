const { pascalize } = require('humps');

const ENTITY_TO_NODE_IDS = {
  'item_type': (entity) => `DatoCmsModel-${entity.id}`,
  'field': (entity) => `DatoCmsField-${entity.id}`,
  'upload': (entity) => `DatoCmsAsset-${entity.id}`,
  'item': (entity, { entitiesRepo }) => {
    const siteEntity = entitiesRepo.findEntitiesOfType('site')[0];
    const type = pascalize(entity.itemType.apiKey);
    return siteEntity.locales.map(locale => `DatoCms${type}-${entity.id}-${locale}`);
  },
  'site': (entity, { entitiesRepo }) => {
    return entity.locales.map(locale => `DatoCmsSite-${entity.id}-${locale}`);
  }
};

module.exports = (entity, context) => {
  if (!ENTITY_TO_NODE_IDS[entity.type]) {
    console.log(`Don't know how to delete entity of type '${entity.type}'!`);
    return;
  }

  const result = ENTITY_TO_NODE_IDS[entity.type](entity, context);
  const nodeIdsToDelete = Array.isArray(result) ? result : [result];

  nodeIdsToDelete.map((nodeId) => {
    const node = context.getNode(nodeId);
    if (node) {
      context.actions.deleteNode({ node });
    }
  });
}

