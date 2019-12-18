const { localizedRead } = require('datocms-client');
const { camelize } = require('humps');

const buildTextNode = require('./buildTextNode');
const itemNodeId = require('./itemNodeId');

module.exports = function addField(
  root,
  key,
  entity,
  field,
  node,
  entitiesRepo,
  i18n,
  additionalNodesToCreate,
  additionalNodesPrefix = ''
) {
  const value = localizedRead(
    entity,
    camelize(field.apiKey),
    field.localized,
    i18n,
  );

  switch (field.fieldType) {
    case 'link': {
      root[`${key}___NODE`] = itemNodeId(value, i18n.locale, entitiesRepo);
      break;
    }
    case 'rich_text':
    case 'links': {
      root[`${key}___NODE`] = (value || []).map(id =>
        itemNodeId(id, i18n.locale, entitiesRepo),
      );
      break;
    }
    case 'text': {
      let mediaType = 'text/plain';

      if (field.appeareance.editor === 'markdown') {
        mediaType = 'text/markdown';
      } else if (field.appeareance.editor === 'wysiwyg') {
        mediaType = 'text/html';
      }

      const textNode = buildTextNode(node, additionalNodesPrefix + key, value, mediaType);
      additionalNodesToCreate.push(textNode);

      root[`${key}Node___NODE`] = textNode.id;
      root[key] = value;
      break;
    }
    case 'file': {
      if (value) {
        root[key] = {
          alt: value.alt,
          title: value.title,
          customData: value.customData,
          uploadId___NODE: `DatoCmsAsset-${value.uploadId}`,
          locale: i18n.locale,
        };
      }
      break;
    }
    case 'gallery': {
      root[key] = (value || []).map(v => {
        return {
          alt: v.alt,
          title: v.title,
          customData: v.customData,
          uploadId___NODE: `DatoCmsAsset-${v.uploadId}`,
          locale: i18n.locale,
        };
      });
      break;
    }
    case 'seo': {
      if (value) {
        root[key] = {
          title: value.title,
          description: value.description,
          twitterCard: value.twitterCard,
          image___NODE: value.image && `DatoCmsAsset-${value.image}`,
        };
      }
      break;
    }
    case 'json': {
      if (value) {
        root[key] = JSON.parse(value);
      }
      break;
    }
    default: {
      root[key] = value;
      break;
    }
  }
};
