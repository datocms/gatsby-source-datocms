'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('humps'),
    camelize = _require.camelize,
    pascalize = _require.pascalize;

var initNodeFromEntity = require('./initNodeFromEntity');
var addDigestToNode = require('./addDigestToNode');
var mId = require('./makeId');
var createTextNode = require('./createTextNode');
var createAssetNode = require('./createAssetNode');
var createSeoMetaTagsNode = require('./createSeoMetaTagsNode');

var _require2 = require('datocms-client'),
    Item = _require2.Item,
    i18n = _require2.i18n,
    buildField = _require2.buildField;

var objectEntries = require('object.entries');

var itemNodeId = function itemNodeId(repo, id, locale) {
  if (!id) {
    return null;
  }

  var itemEntity = repo.findEntity('item', id);
  return mId(itemEntity, locale);
};

module.exports = function createItemNodes(repo, itemsRepo, createNode) {
  var items = repo.findEntitiesOfType('item');
  var site = repo.findEntitiesOfType('site')[0];

  var itemNodes = {};

  i18n.availableLocales = itemsRepo.site.locales;

  itemsRepo.site.locales.forEach(function (locale) {
    i18n.locale = locale;

    items.forEach(function (item) {
      var itemNode = initNodeFromEntity(item, locale);
      itemNode.locale = locale;

      itemNode.model___NODE = mId(item.itemType);

      item.itemType.fields.forEach(function (field) {
        var fieldType = field.fieldType;
        var localized = field.localized;

        var value = void 0;

        if (localized) {
          value = (item[camelize(field.apiKey)] || {})[locale];
        } else {
          value = item[camelize(field.apiKey)];
        }

        var key = camelize(field.apiKey);

        switch (fieldType) {
          case 'link':
            {
              if (value) {
                itemNode[key + '___NODE'] = itemNodeId(repo, value, locale);
              }

              break;
            }
          case 'rich_text':
          case 'links':
            {
              itemNode[key + '___NODE'] = (value || []).map(function (id) {
                return itemNodeId(repo, id, locale);
              });
              break;
            }
          case 'text':
            {
              var mediaType = 'text/plain';

              if (field.appeareance.editor === 'markdown') {
                mediaType = 'text/markdown';
              } else if (field.appeareance.editor === 'wysiwyg') {
                mediaType = 'text/html';
              }

              itemNode[key + 'Node___NODE'] = createTextNode(itemNode, key, value, mediaType, createNode);
              itemNode[key] = value;
              break;
            }
          case 'file':
            {
              if (value) {
                itemNode[key + '___NODE'] = createAssetNode(itemNode, key, value, itemsRepo, createNode);
              }
              break;
            }
          case 'gallery':
            {
              itemNode[key + '___NODE'] = (value || []).map(function (asset) {
                return createAssetNode(itemNode, key, asset, itemsRepo, createNode);
              });
              break;
            }
          default:
            {
              var fieldValue = buildField(field.fieldType, value, itemsRepo);
              itemNode[key] = fieldValue && fieldValue.toMap ? fieldValue.toMap() : fieldValue;
              break;
            }
        }
      });

      itemNode.seoMetaTags___NODE = createSeoMetaTagsNode(itemNode, itemsRepo.find(item.id), itemsRepo.site, createNode);

      itemNode.updatedAt = item.updatedAt;

      if (item.itemType.sortable) {
        itemNode.position = item.position;
      }

      if (item.itemType.tree) {
        itemNode.position = item.position;

        if (item.parentId) {
          var parentId = itemNodeId(repo, item.parentId, locale);
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
        var treeChildren = itemNodes[itemNode.id].treeChildren___NODE;
        itemNode.treeChildren___NODE = treeChildren;
      }

      itemNodes[itemNode.id] = itemNode;
    });
  });

  objectEntries(itemNodes).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        itemNode = _ref2[1];

    addDigestToNode(itemNode);
    createNode(itemNode);
  });
};