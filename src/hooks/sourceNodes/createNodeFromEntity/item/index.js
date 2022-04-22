const { pascalize } = require('humps');
const { camelize } = require('datocms-client');
const { localizedRead } = require('datocms-client');

const buildNode = require('../utils/buildNode');

module.exports = function buildItemNode(
  entity,
  {
    entitiesRepo,
    localesToGenerate: rawLocalesToGenerate,
    localeFallbacks,
    generateType,
  },
) {
  const siteEntity = entitiesRepo.site;
  const type = generateType(`${pascalize(entity.itemType.apiKey)}`);
  const allLocales = Array.isArray(rawLocalesToGenerate)
    ? rawLocalesToGenerate
    : siteEntity.locales;
  const firstLocalizedField = entity.itemType.fields.find(f => f.localized);
  const localesToGenerate = !firstLocalizedField
    ? [siteEntity.locales[0]]
    : entity.itemType.allLocalesRequired
    ? allLocales
    : Object.keys(entity[camelize(firstLocalizedField.apiKey)]);

  return [].concat(
    ...localesToGenerate.map(locale => {
      const additionalNodesToCreate = [];
      const i18n = {
        locale: locale,
        fallbacks: localeFallbacks,
      };

      const itemNode = buildNode(
        type,
        [entity.id, locale].filter(x => !!x).join('-'),
        node => {
          node.locale = locale;
          node.entityPayload = entity.payload;
          node.digest = entity.meta.updatedAt;

          entity.itemType.fields
            .filter(field => field.fieldType === 'text')
            .forEach(field => {
              const camelizedApiKey = camelize(field.apiKey);

              let mediaType = 'text/plain';

              if (field.appeareance.editor === 'markdown') {
                mediaType = 'text/markdown';
              } else if (field.appeareance.editor === 'wysiwyg') {
                mediaType = 'text/html';
              }

              const value = localizedRead(
                entity,
                camelizedApiKey,
                field.localized,
                i18n,
              );

              const textNode = buildNode(
                'DatoCmsTextNode',
                [entity.id, locale, camelizedApiKey].filter(x => !!x).join('-'),
                node => {
                  node.internal.mediaType = mediaType;
                  node.internal.content = value || '';
                  node.digest = entity.meta.updatedAt;
                },
              );

              additionalNodesToCreate.push(textNode);
            });

          const seoNode = buildNode(
            generateType('SeoMetaTags'),
            node.id,
            node => {
              node.digest = entity.meta.updatedAt;
              node.itemNodeId = `${type}-${entity.id}-${locale}`;
              node.locale = locale;
            },
          );

          additionalNodesToCreate.push(seoNode);
          node.seoMetaTags___NODE = seoNode.id;
        },
      );

      return [itemNode].concat(additionalNodesToCreate);
    }),
  );
};
