const { pascalize } = require('humps');
const { camelize } = require('datocms-client');
const { localizedRead } = require('datocms-client');

const buildNode = require('../utils/buildNode');

module.exports = function buildItemNode(entity, { generateType }) {
  const type = generateType(`${pascalize(entity.itemType.apiKey)}`);

  const itemNode = buildNode(type, entity.id, node => {
    node.entityPayload = entity.payload;
  });

  const nodesForItemFieldsGeneratingMarkdown = entity.itemType.fields
    .filter(field => field.fieldType === 'text')
    .flatMap(field => {
      const camelizedApiKey = camelize(field.apiKey);

      const mediaType =
        field.appearance.editor === 'markdown'
          ? 'text/markdown'
          : field.appearance.editor === 'wysiwyg'
          ? 'text/html'
          : 'text/plain';

      if (field.localized) {
        const locales = Object.keys(entity[camelizedApiKey]);

        const nodes = locales.map(locale =>
          buildNode(
            'DatoCmsTextNode',
            [entity.id, locale, camelizedApiKey].join('-'),
            node => {
              node.internal.mediaType = mediaType;
              node.internal.content = entity[camelizedApiKey][locale] || '';
              node.digest = entity.meta.updatedAt;
            },
          ),
        );

        return nodes;
      } else {
        const nodes = [
          buildNode(
            'DatoCmsTextNode',
            [entity.id, camelizedApiKey].join('-'),
            node => {
              node.internal.mediaType = mediaType;
              node.internal.content = entity[camelizedApiKey] || '';
              node.digest = entity.meta.updatedAt;
            },
          ),
        ];

        return nodes;
      }
    });

  return [itemNode].concat(nodesForItemFieldsGeneratingMarkdown);
};
