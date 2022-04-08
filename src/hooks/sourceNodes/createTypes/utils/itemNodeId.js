const { pascalize } = require('humps');

module.exports = function itemNodeId(id, locale, entitiesRepo, generateType) {
  if (!id) {
    return null;
  }

  const entity = entitiesRepo.findEntity('item', id);
  if (!entity) {
    return null;
  }

  const firstLocalizedField = entity.itemType.fields.find(f => f.localized);

  if (!firstLocalizedField) {
    return generateType(
      `${pascalize(entity.itemType.apiKey)}-${entity.id}-${
        entitiesRepo.site.locales[0]
      }`,
    );
  }

  return generateType(
    `${pascalize(entity.itemType.apiKey)}-${entity.id}-${locale}`,
  );
};
