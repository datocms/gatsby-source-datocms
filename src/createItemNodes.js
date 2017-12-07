const { camelize, pascalize } = require('humps');
const initNodeFromEntity = require('./initNodeFromEntity');
const addDigestToNode = require('./addDigestToNode');
const mId = require('./makeId');
const createTextNode = require('./createTextNode');
const createAssetNode = require('./createAssetNode');
const createSeoMetaTagsNode = require('./createSeoMetaTagsNode');
const Item = require('datocms-client/lib/local/Item');
const ItemsRepo = require('datocms-client/lib/local/ItemsRepo');
const i18n = require('datocms-client/lib/utils/i18n');
const build = require('datocms-client/lib/local/fields/build');

const itemNodeId = (repo, id, locale) => {
  if (!id) {
    return null;
  }

  const itemEntity = repo.findEntity('item', id);
  return mId(itemEntity, locale);
};

module.exports = function createItemNodes(repo, createNode) {
  const items = repo.findEntitiesOfType('item');
  const site = repo.findEntitiesOfType('site')[0];
  const itemsRepo = new ItemsRepo(repo);

  const itemNodes = {};

  i18n.availableLocales = itemsRepo.site.locales;

  itemsRepo.site.locales.forEach(locale => {
    i18n.locale = locale;

    items.forEach(item => {
      let itemNode = initNodeFromEntity(item, locale);
      itemNode.locale = locale;

      itemNode.model___NODE = mId(item.itemType);

      item.itemType.fields.forEach(field => {
        const fieldType = field.fieldType;
        const localized = field.localized;

        let value;

        if (localized) {
          value = (item[camelize(field.apiKey)] || {})[locale];
        } else {
          value = item[camelize(field.apiKey)];
        }

        const key = camelize(field.apiKey);

        switch (fieldType) {
          case 'link':
            {
              itemNode[`${key}___NODE`] = itemNodeId(repo, value, locale);
              break;
            }
          case 'rich_text':
          case 'links':
            {
              itemNode[`${key}___NODE`] = (value || []).map(id => itemNodeId(repo, id, locale));
              break;
            }
          case 'text':
            {
              let mediaType = 'text/plain';

              if (field.appeareance.type === 'markdown') {
                mediaType = 'text/markdown';
              } else if (field.appeareance.type === 'wysiwyg') {
                mediaType = 'text/html';
              }

              itemNode[`${key}Node___NODE`] = createTextNode(itemNode, key, value, mediaType, createNode);
              itemNode[key] = value;
              break;
            }
          case 'image':
          case 'file': {
            itemNode[`${key}___NODE`] = createAssetNode(itemNode, key, value, itemsRepo, createNode);
            break;
          }
          case 'gallery': {
            itemNode[`${key}___NODE`] = (value || []).map(asset => createAssetNode(itemNode, key, asset, itemsRepo, createNode));
            break;
          }
          default:
            {
              const fieldValue = build(field.fieldType, value, itemsRepo);
              itemNode[key] = fieldValue && fieldValue.toMap ? fieldValue.toMap() : fieldValue;
              break;
            }
        }
      });

      itemNode.seoMetaTags___NODE = createSeoMetaTagsNode(
        itemNode,
        itemsRepo.find(item.id),
        itemsRepo.site,
        createNode
      );

      itemNode.updatedAt = item.updatedAt;

      if (item.itemType.sortable) {
        itemNode.position = item.position;
      }

      if (item.itemType.tree) {
        itemNode.position = item.position;

        if (item.parentId) {
          const parentId = itemNodeId(repo, item.parentId, locale);
          itemNode.treeParent___NODE = parentId;
          itemNodes[parentId] = itemNodes[parentId] || {};
          itemNodes[parentId].treeChildren___NODE = itemNodes[parentId].treeChildren___NODE || [];
          itemNodes[parentId].treeChildren___NODE.push(itemNode.id);
          itemNode.treeChildren___NODE = [];
          itemNode.root = false;
        } else {
          itemNode.root = true;
          itemNode.treeChildren___NODE = [];
          itemNode.treeParent___NODE = null;
        }
      }

      if (itemNodes[itemNode.id]) {
        const treeChildren = itemNodes[itemNode.id].treeChildren___NODE;
        itemNode.treeChildren___NODE = treeChildren;
      }

      itemNodes[itemNode.id] = itemNode;
    });
  });

  Object.entries(itemNodes).forEach(([key, itemNode]) => {
    addDigestToNode(itemNode);
    createNode(itemNode);
  });
};
