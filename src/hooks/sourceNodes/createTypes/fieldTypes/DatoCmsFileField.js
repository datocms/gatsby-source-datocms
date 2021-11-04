const buildAssetFields = require('../utils/buildAssetFields');

module.exports = ({ actions, schema, cache }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsFileField',
      extensions: { infer: false },
      fields: {
        ...buildAssetFields({ cache }),
        alt: 'String',
        title: 'String',
        customData: 'JSON',
        focalPoint: 'DatoCmsFocalPoint',
      },
    }),
    schema.buildObjectType({
      name: 'DatoCmsFocalPoint',
      extensions: { infer: false },
      fields: {
        x: 'Float!',
        y: 'Float!',
      },
    }),
  ]);
};
