const buildAssetFields = require('../utils/buildAssetFields');

module.exports = ({ actions, schema, cacheDir }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsFileField',
      extensions: { infer: false },
      fields: {
        ...buildAssetFields({ cacheDir }),
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
