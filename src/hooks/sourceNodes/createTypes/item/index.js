const { camelize, pascalize } = require('humps');
const objectAssign = require('object-assign');

const gqlItemTypeName = (itemType) => `DatoCms${pascalize(itemType.apiKey)}`;

const simpleTypeResolver = (type) => ({ field }) => ({ fieldType: type });

const combineResolvers = (resolvers) => (context) => (
  resolvers.reduce((acc, resolver) => objectAssign(acc, resolver(context)))
);

const fieldResolvers = {
  boolean: simpleTypeResolver('Boolean'),
  color: simpleTypeResolver('DatoCmsColorField'),
  date: simpleTypeResolver('Date'),
  date_time: simpleTypeResolver('Date'),
  file: simpleTypeResolver('DatoCmsAsset'),
  float: simpleTypeResolver('Float'),
  gallery: simpleTypeResolver('[DatoCmsAsset]'),
  integer: simpleTypeResolver('Int'),
  json: simpleTypeResolver('JSON'),
  lat_lon: simpleTypeResolver('DatoCmsLatLonField'),
  link: require('./fields/link'),
  links: require('./fields/richText'),
  rich_text: require('./fields/richText'),
  seo: simpleTypeResolver('DatoCmsSeoField'),
  slug: simpleTypeResolver('String'),
  string: simpleTypeResolver('String'),
  text: simpleTypeResolver('String'),
  video: simpleTypeResolver('DatoCmsVideoField'),
};

module.exports = ({ entitiesRepo, actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsColorField',
      fields: {
        red: 'Int',
        green: 'Int',
        blue: 'Int',
        alpha: 'Int',
        rgb: {
          type: 'String',
          resolve: (parent) => {
            if (parent.alpha === 255) {
              return `rgb(${parent.red}, ${parent.green}, ${parent.blue})`;
            }

            return `rgba(${parent.red}, ${parent.green}, ${parent.blue}, ${parent.alpha})`;
          },
        },
        hex: {
          type: 'String',
          resolve: (parent) => {
            const rgba = ['red', 'green', 'blue', 'alpha'].map((component) => {
              const hex = parent[component].toString(16);
              return hex.length === 1 ? `0${hex}` : hex;
            });

            return rgba[3] === 'ff' ?
              `#${rgba.slice(0, 3).join('')}` :
              `#${rgba.join('')}`;
          },
        },
      },
    }),
    schema.buildObjectType({
      name: 'DatoCmsLatLonField',
      fields: {
        latitude: 'Float',
        longitude: 'Float',
      },
    }),
    schema.buildObjectType({
      name: 'DatoCmsSeoField',
      fields: {
        title: 'String',
        description: 'String',
        twitterCard: 'String',
        image: 'DatoCmsAsset',
      },
    }),
    schema.buildObjectType({
      name: 'DatoCmsVideoField',
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
      fields: {
        createdAt: 'Date',
        updatedAt: 'Date',
        publishedAt: 'Date',
        firstPublishedAt: 'Date',
        isValid: 'Boolean',
        status: 'String',
      },
    }),
  ]);

  entitiesRepo.findEntitiesOfType('item_type').forEach((entity) => {
    const type = gqlItemTypeName(entity);

    const fields = entity.fields.reduce((acc, field) => {
      const resolver = fieldResolvers[field.fieldType];

      if (resolver) {
        const { types = [], fieldType } = resolver({
          parentItemType: entity,
          field,
          gqlItemTypeName,
          schema,
          entitiesRepo,
        });

        actions.createTypes(types);
        objectAssign(acc, { [camelize(field.apiKey)]: fieldType });

        if (field.localized) {
          const parentItemTypeName = gqlItemTypeName(entity);
          const allLocalesTypeName = `DatoCmsAllLocalesFor${parentItemTypeName}${pascalize(field.apiKey)}`;

          actions.createTypes([
            schema.buildObjectType({
              name: allLocalesTypeName,
              fields: {
                locale: 'String',
                value: fieldType,
              },
            }),
          ]);

          objectAssign(acc, { [`_all${pascalize(field.apiKey)}Locales`]: `[${allLocalesTypeName}]` });
        }
      }

      return acc;
    }, {});


    actions.createTypes([
      schema.buildObjectType({
        name: type,
        fields: objectAssign(fields, {
          meta: `DatoCmsMetaField`
        }),
        interfaces: [`Node`],
      })
    ]);
  });
}
