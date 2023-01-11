const { camelize, pascalize } = require('humps');
const objectAssign = require('object-assign');
const { camelizeKeys, localizedRead } = require('datocms-client');
const simpleField = require('./fields/simpleField');
const simpleFieldReturnCamelizedKeys = require('./fields/simpleFieldReturnCamelizedKeys');
const itemNodeId = require('../utils/itemNodeId');
const { seoTagsBuilder, JsonApiEntity } = require('datocms-client');

function getI18n(args, context, info, mainLocale) {
  const queryContext = context.sourceDatocms.getQueryContext(context);

  if (args.locale) {
    queryContext.localeState.set(info, args.locale);
  }

  if (args.fallbackLocales) {
    queryContext.fallbackLocalesState.set(info, args.fallbackLocales);
  }

  const locale = queryContext.localeState.get(info) || mainLocale;

  return {
    locale,
    fallbacks: {
      [locale]: queryContext.fallbackLocalesState.get(info) || [],
    },
  };
}

function getAllLocalesI18n(node, args, context, info) {
  context.sourceDatocms
    .getQueryContext(context)
    .localeState.set(info, node.locale);
  context.sourceDatocms
    .getQueryContext(context)
    .fallbackLocalesState.set(info, []);

  return {
    locale: node.locale,
    fallbacks: {},
  };
}

module.exports = ({
  entitiesRepo,
  fallbackLocales,
  actions,
  schema,
  generateType,
}) => {
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
    seo: simpleFieldReturnCamelizedKeys(generateType('SeoField')),
    slug: simpleField('String'),
    string: simpleField('String'),
    text: simpleField('String'),
    video: simpleFieldReturnCamelizedKeys('DatoCmsVideoField'),
  };

  const gqlItemTypeName = itemType => generateType(pascalize(itemType.apiKey));

  const siteEntity = entitiesRepo.site;
  const allLocales = siteEntity.locales;
  const mainLocale = allLocales[0];

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
            args: field.localized
              ? {
                  locale: `String`,
                  fallbackLocales: `[String!]`,
                }
              : undefined,
            resolve: (node, args, context, info) => {
              const i18n = getI18n(args, context, info, mainLocale);

              const value = localizedRead(
                node.entityPayload.attributes,
                field.apiKey,
                field.localized,
                i18n,
              );

              return resolveForSimpleField(
                value,
                context,
                node,
                i18n,
                generateType,
              );
            },
          },
        });

        if (nodeType) {
          objectAssign(acc, {
            [`${camelize(field.apiKey)}Node`]: {
              type: nodeType,
              resolve: (node, args, context, info) => {
                const i18n = getI18n(args, context, info, mainLocale);

                const value = localizedRead(
                  node.entityPayload.attributes,
                  field.apiKey,
                  field.localized,
                  i18n,
                );
                return resolveForNodeField(
                  value,
                  context,
                  node,
                  i18n,
                  generateType,
                );
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
                  resolve: (node, args, context, info) => {
                    const i18n = getAllLocalesI18n(node, args, context, info);

                    const value = localizedRead(
                      node.entityPayload.attributes,
                      field.apiKey,
                      field.localized,
                      i18n,
                    );
                    return resolveForSimpleField(
                      value,
                      context,
                      node,
                      i18n,
                      generateType,
                    );
                  },
                },
                ...(nodeType
                  ? {
                      valueNode: {
                        type: nodeType,
                        resolve: (node, args, context, info) => {
                          const i18n = getAllLocalesI18n(
                            node,
                            args,
                            context,
                            info,
                          );

                          const value = localizedRead(
                            node.entityPayload.attributes,
                            field.apiKey,
                            field.localized,
                            i18n,
                          );
                          return resolveForNodeField(
                            value,
                            context,
                            node,
                            i18n,
                            generateType,
                          );
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
                id: itemNodeId(parentId, entitiesRepo, generateType),
              });
            }
          },
        },
        treeChildren: {
          type: `[${type}]`,
          resolve: async (node, args, context) => {
            const { entries: allItems } = await context.nodeModel.findAll({
              type: type,
              query: {},
            });

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

    const firstLocalizedField = entity.fields.find(f => f.localized);
    const someFieldsLocalized = !!firstLocalizedField;

    actions.createTypes([
      schema.buildObjectType({
        name: type,
        extensions: { infer: false },
        fields: objectAssign(fields, {
          meta: {
            type: 'DatoCmsMetaField!',
            resolve: node => camelizeKeys(node.entityPayload.meta),
          },
          originalId: {
            type: 'String!',
            resolve: node => {
              return node.entityPayload.id;
            },
          },
          ...(firstLocalizedField
            ? {
                locales: {
                  type: '[String!]!',
                  resolve: node => {
                    return Object.keys(
                      node.entityPayload.attributes[firstLocalizedField.apiKey],
                    );
                  },
                },
              }
            : {}),
          seoMetaTags: {
            type: generateType('SeoMetaTags'),
            args: someFieldsLocalized
              ? {
                  locale: `String`,
                  fallbackLocales: `[String!]`,
                }
              : undefined,
            resolve: (node, args, context, info) => {
              const i18n = getI18n(args, context, info, mainLocale);

              const tags = seoTagsBuilder(
                new JsonApiEntity(node.entityPayload, entitiesRepo),
                entitiesRepo,
                i18n,
              );

              return {
                tags,
              };
            },
          },
          model: {
            type: generateType('Model'),
            resolve: (node, args, context) => {
              return context.nodeModel.getNodeById({
                id: generateType(
                  `Model-${node.entityPayload.relationships.item_type.data.id}`,
                ),
              });
            },
          },
        }),
        interfaces: [`Node`],
      }),
    ]);
  });
};
