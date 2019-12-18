const { camelize, pascalize } = require('humps');
const objectAssign = require('object-assign');

const gqlItemTypeName = itemType => `DatoCms${pascalize(itemType.apiKey)}`;

const simpleTypeResolver = type => ({ field }) => ({ fieldType: type });

const combineResolvers = resolvers => context =>
  resolvers.reduce((acc, resolver) => objectAssign(acc, resolver(context)));

const dateType = {
  type: 'Date',
  extensions: { dateformat: {} },
};

const fieldResolvers = {
  boolean: simpleTypeResolver('Boolean'),
  color: simpleTypeResolver('DatoCmsColorField'),
  date: simpleTypeResolver(dateType),
  date_time: simpleTypeResolver(dateType),
  file: require('./fields/file'),
  float: simpleTypeResolver('Float'),
  gallery: require('./fields/gallery'),
  integer: simpleTypeResolver('Int'),
  json: simpleTypeResolver('JSON'),
  lat_lon: simpleTypeResolver('DatoCmsLatLonField'),
  link: require('./fields/link'),
  links: require('./fields/richText'),
  rich_text: require('./fields/richText'),
  seo: simpleTypeResolver('DatoCmsSeoField'),
  slug: simpleTypeResolver('String'),
  string: simpleTypeResolver('String'),
  text: require('./fields/text'),
  video: simpleTypeResolver('DatoCmsVideoField'),
};

module.exports = ({ entitiesRepo, actions, schema }) => {
  entitiesRepo.findEntitiesOfType('item_type').forEach(entity => {
    const type = gqlItemTypeName(entity);

    const fields = entity.fields.reduce((acc, field) => {
      const resolver = fieldResolvers[field.fieldType];

      if (resolver) {
        const { types = [], fieldType, nodeFieldType } = resolver({
          parentItemType: entity,
          field,
          gqlItemTypeName,
          schema,
          entitiesRepo,
        });

        actions.createTypes(types);
        objectAssign(acc, { [camelize(field.apiKey)]: fieldType });

        if (nodeFieldType) {
          objectAssign(acc, {
            [`${camelize(field.apiKey)}Node`]: nodeFieldType,
          });
        }

        if (field.localized) {
          const parentItemTypeName = gqlItemTypeName(entity);
          const allLocalesTypeName = `DatoCmsAllLocalesFor${parentItemTypeName}${pascalize(
            field.apiKey,
          )}`;

          const fields = {
            locale: 'String',
            value: fieldType,
          };

          if (nodeFieldType) {
            objectAssign(fields, {
              valueNode: nodeFieldType,
            });
          }

          actions.createTypes([
            schema.buildObjectType({
              name: allLocalesTypeName,
              extensions: { infer: false },
              fields,
            }),
          ]);

          objectAssign(acc, {
            [`_all${pascalize(
              field.apiKey,
            )}Locales`]: `[${allLocalesTypeName}]`,
          });
        }
      }

      return acc;
    }, {});

    if (entity.sortable || entity.tree) {
      objectAssign(fields, {
        position: 'Int',
      });
    }

    if (entity.tree) {
      objectAssign(fields, {
        treeParent: {
          type,
          extensions: {
            link: {
              by: 'id',
              from: 'treeParent___NODE',
            },
          },
        },
        treeChildren: {
          type: `[${type}]`,
          extensions: {
            link: {
              by: 'id',
              from: 'treeChildren___NODE',
            },
          },
        },
        root: 'Boolean',
      });
    }

    actions.createTypes([
      schema.buildObjectType({
        name: type,
        extensions: { infer: false },
        fields: objectAssign(fields, {
          meta: 'DatoCmsMetaField',
          originalId: 'String',
          locale: 'String',
          seoMetaTags: {
            type: 'DatoCmsSeoMetaTags',
            extensions: {
              link: { by: 'id', from: 'seoMetaTags___NODE' },
            },
          },
          model: {
            type: 'DatoCmsModel',
            extensions: {
              link: { by: 'id', from: 'model___NODE' },
            },
          },
        }),
        interfaces: [`Node`],
      }),
    ]);
  });
};
