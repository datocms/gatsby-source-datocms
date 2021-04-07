const { pascalize } = require('humps');

module.exports = function itemNodeId(id, locale, entitiesRepo, generateType) {
  if (!id) {
    return null;
  }

  const entity = entitiesRepo.findEntity('item', id);
  if (!entity) {
    return null;
  }

  return generateType(
    `${pascalize(entity.itemType.apiKey)}-${entity.id}-${locale}`,
  );
};
