const { camelize, pascalize } = require('humps');
const { Site, Item } = require('datocms-client');
const entries = require('object.entries');

const buildNode = require('../utils/buildNode');
const buildSeoMetaTagsNode = require('./buildSeoMetaTagsNode');
const itemNodeId = require('./itemNodeId');
const addField = require('./addField');

module.exports = function buildItemNode(
  entity,
  {
    entitiesRepo,
    getNode,
    actions,
    localeFallbacks,
  }
) {
  const siteEntity = entitiesRepo.site;
  const type = pascalize(entity.itemType.apiKey);

  return [].concat(
    ...siteEntity.locales.map(locale => {
      const additionalNodesToCreate = [];
      const i18n = { locale, fallbacks: localeFallbacks };

      const itemNode = buildNode(`DatoCms${type}`, `${entity.id}-${locale}`, (node) => {
        node.locale = locale;
        node.model___NODE = `DatoCmsModel-${entity.itemType.id}`;

        entity.itemType.fields.forEach(field => {
          addField(node, camelize(field.apiKey), entity, field, node, entitiesRepo, i18n, additionalNodesToCreate);

          if (field.localized) {
            node[`_all${pascalize(field.apiKey)}Locales`] = entries(entity[camelize(field.apiKey)] || {}).map(([locale, v]) => {
              const result = { locale };
              const innerI18n = { locale, fallbacks: localeFallbacks };
              addField(result, 'value', entity, field, node, entitiesRepo, innerI18n, additionalNodesToCreate);
              return result;
            });
          }
        });

        const seoNode = buildSeoMetaTagsNode(node, entity, entitiesRepo, i18n);
        node.children = node.children.concat([seoNode.id]);
        additionalNodesToCreate.push(seoNode);

        node.seoMetaTags___NODE = seoNode.id;

        node.meta = entity.meta;
        node.originalId = entity.id;

        if (entity.itemType.sortable) {
          node.position = entity.position;
        }

        if (entity.itemType.tree) {
          node.position = entity.position;
          node.root = !entity.parentId;
          node.treeChildren___NODE = [];

          if (entity.parentId) {
            const parentId = itemNodeId(entity.parentId, locale, entitiesRepo);
            node.treeParent___NODE = parentId;
          }
        }
      });

      return [itemNode].concat(additionalNodesToCreate);
    })
  );
}
