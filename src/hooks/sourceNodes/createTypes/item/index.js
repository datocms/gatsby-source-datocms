const { camelize, pascalize } = require('humps');
const objectAssign = require('object-assign');
const { camelizeKeys, localizedRead } = require('datocms-client');
const simpleField = require('./fields/simpleField');
const simpleFieldReturnCamelizedKeys = require('./fields/simpleFieldReturnCamelizedKeys');
const itemNodeId = require('../utils/itemNodeId');

const fieldResolvers = {
  boolean: simpleField('Boolean'),
  color: simpleField('DatoCmsColorField'),
  date: require('./fields/date'),
  date_time: require('./fields/date'),
  file: require('./fields/file'),
  float: simpleField('Float'),
  gallery: require('./fields/gallery'),
  integer: simpleField('Int'),
  json: simpleField('JSON'),
  lat_lon: simpleField('DatoCmsLatLonField'),
  link: require('./fields/link'),
  links: require('./fields/richText'),
  rich_text: require('./fields/richText'),
  structured_text: require('./fields/structuredText'),
  seo: simpleFieldReturnCamelizedKeys('DatoCmsSeoField'),
  slug: simpleField('String'),
  string: simpleField('String'),
  text: require('./fields/text'),
  video: simpleFieldReturnCamelizedKeys('DatoCmsVideoField'),
};

module.exports = ({ entitiesRepo, localeFallbacks, actions, schema, generateType }) => {
  const gqlItemTypeName = itemType => generateType(pascalize(itemType.apiKey));

  entitiesRepo.findEntitiesOfType('item_type').forEach(entity => {
    const type = gqlItemTypeName(entity);

    const fields = entity.fields.reduce((acc, field) => {
      const resolver = fieldResolvers[field.fieldType];

      if (resolver) {
        const {
          additionalTypesToCreate = [],
          type,
          nodeType,
          extensions,
          resolveForSimpleField,
          resolveForNodeField,
        } = resolver({
          parentItemType: entity,
          field,
          gqlItemTypeName,
          schema,
          entitiesRepo,
          generateType,
        });

        actions.createTypes(additionalTypesToCreate);

        objectAssign(acc, {
          [camelize(field.apiKey)]: {
            type,
            ...(extensions ? { extensions } : {}),
            resolve: (node, _args, context) => {
              const i18n = { locale: node.locale, fallbacks: localeFallbacks };
              const value = localizedRead(
                node.entityPayload.attributes,
                field.apiKey,
                field.localized,
                i18n,
              );
              return resolveForSimpleField(value, context, node, i18n);
            },
          },
        });

        if (nodeType) {
          objectAssign(acc, {
            [`${camelize(field.apiKey)}Node`]: {
              type: nodeType,
              resolve: (node, args, context) => {
                const i18n = {
                  locale: node.locale,
                  fallbacks: localeFallbacks,
                };
                const value = localizedRead(
                  node.entityPayload.attributes,
                  field.apiKey,
                  field.localized,
                  i18n,
                );
                return resolveForNodeField(value, context, node, i18n);
              },
            },
          });
        }

        if (field.localized) {
          const parentItemTypeName = gqlItemTypeName(entity);
          const allLocalesTypeName = `DatoCmsAllLocalesFor${parentItemTypeName}${pascalize(
            field.apiKey,
          )}`;

          actions.createTypes([
            schema.buildObjectType({
              name: allLocalesTypeName,
              extensions: { infer: false },
              fields: {
                locale: 'String',
                value: {
                  type,
                  resolve: (node, args, context) => {
                    const i18n = {
                      locale: node.locale,
                      fallbacks: localeFallbacks,
                    };
                    const value = localizedRead(
                      node.entityPayload.attributes,
                      field.apiKey,
                      field.localized,
                      i18n,
                    );
                    return resolveForSimpleField(value, context, node, i18n);
                  },
                },
                ...(nodeType
                  ? {
                      valueNode: {
                        type: nodeType,
                        resolve: (node, args, context) => {
                          const i18n = {
                            locale: node.locale,
                            fallbacks: localeFallbacks,
                          };
                          const value = localizedRead(
                            node.entityPayload.attributes,
                            field.apiKey,
                            field.localized,
                            i18n,
                          );
                          return resolveForNodeField(value, context, node, i18n);
                        },
                      },
                    }
                  : {}),
              },
            }),
          ]);

          objectAssign(acc, {
            [`_all${pascalize(field.apiKey)}Locales`]: {
              type: `[${allLocalesTypeName}]`,
              resolve: node => {
                const locales = Object.keys(
                  node.entityPayload.attributes[field.apiKey] || {},
                );
                return locales.map(locale => ({
                  locale,
                  entityPayload: node.entityPayload,
                }));
              },
            },
          });
        }
      }

      return acc;
    }, {});

    if (entity.sortable || entity.tree) {
      objectAssign(fields, {
        position: {
          type: 'Int',
          resolve: node => node.entityPayload.attributes.position,
        },
      });
    }

    if (entity.tree) {
      objectAssign(fields, {
        treeParent: {
          type,
          resolve: (node, args, context) => {
            const parentId = node.entityPayload.attributes.parent_id;
            if (parentId) {
              return context.nodeModel.getNodeById({
                id: itemNodeId(parentId, node.locale, entitiesRepo, generateType),
              });
            }
          },
        },
        treeChildren: {
          type: `[${type}]`,
          resolve: (node, args, context) => {
            const allItems = context.nodeModel.getAllNodes({ type: type });

            const children = allItems.filter(
              otherNode =>
                otherNode.entityPayload.attributes.parent_id ===
                  node.entityPayload.id && otherNode.locale === node.locale,
            );

            return children;
          },
        },
        root: {
          type: 'Boolean',
          resolve: node => !node.entityPayload.attributes.parent_id,
        },
      });
    }

    actions.createTypes([
      schema.buildObjectType({
        name: type,
        extensions: { infer: false },
        fields: objectAssign(fields, {
          meta: {
            type: 'DatoCmsMetaField',
            resolve: node => camelizeKeys(node.entityPayload.meta),
          },
          originalId: {
            type: 'String',
            resolve: node => {
              return node.entityPayload.id;
            },
          },
          locale: 'String',
          seoMetaTags: {
            type: generateType('SeoMetaTags'),
            resolve: (node, args, context) => {
              return context.nodeModel.getNodeById({
                id: generateType(`SeoMetaTags-${node.id}`),
              });
            },
          },
          model: {
            type: generateType('Model'),
            resolve: (node, args, context) => {
              return context.nodeModel.getNodeById({
                id: generateType(`Model-${node.entityPayload.relationships.item_type.data.id}`),
              });
            },
          },
        }),
        interfaces: [`Node`],
      }),
    ]);
  });
};
