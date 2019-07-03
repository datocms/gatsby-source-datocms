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
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsColorField',
      extensions: { infer: false },
      fields: {
        red: 'Int',
        green: 'Int',
        blue: 'Int',
        alpha: 'Int',
        rgb: {
          type: 'String',
          resolve: parent => {
            if (parent.alpha === 255) {
              return `rgb(${parent.red}, ${parent.green}, ${parent.blue})`;
            }

            return `rgba(${parent.red}, ${parent.green}, ${parent.blue}, ${
              parent.alpha
            })`;
          },
        },
        hex: {
          type: 'String',
          resolve: parent => {
            const rgba = ['red', 'green', 'blue', 'alpha'].map(component => {
              const hex = parent[component].toString(16);
              return hex.length === 1 ? `0${hex}` : hex;
            });

            return rgba[3] === 'ff'
              ? `#${rgba.slice(0, 3).join('')}`
              : `#${rgba.join('')}`;
          },
        },
      },
    }),
    schema.buildObjectType({
      name: 'DatoCmsLatLonField',
      extensions: { infer: false },
      fields: {
        latitude: 'Float',
        longitude: 'Float',
      },
    }),
    schema.buildObjectType({
      name: 'DatoCmsSeoField',
      extensions: { infer: false },
      fields: {
        title: 'String',
        description: 'String',
        twitterCard: 'String',
        image: {
          type: 'DatoCmsAsset',
          resolve: (parent, args, context) => {
            const id = parent.image___NODE;
            if (id) {
              return context.nodeModel.getNodeById({ id: id });
            }
          }
        },
      },
    }),
    schema.buildObjectType({
      name: 'DatoCmsVideoField',
      extensions: { infer: false },
      fields: {
        url: 'String',
        title: 'String',
        provider: 'String',
        providerUid: 'String',
        thumbnailUrl: 'String',
        width: 'Int',
        height: 'Int',
      },
    }),
    schema.buildObjectType({
      name: 'DatoCmsMetaField',
      extensions: { infer: false },
      fields: {
        createdAt: dateType,
        updatedAt: dateType,
        publishedAt: dateType,
        firstPublishedAt: dateType,
        isValid: 'Boolean',
        status: 'String',
      },
    }),
    schema.buildObjectType({
      name: 'DatoCmsSeoMetaTags',
      extensions: { infer: false },
      fields: {
        tags: 'JSON',
      },
      interfaces: [`Node`],
    }),
  ]);

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

          actions.createTypes([
            schema.buildObjectType({
              name: allLocalesTypeName,
              extensions: { infer: false },
              fields: {
                locale: 'String',
                value: fieldType,
              },
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
