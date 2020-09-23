const buildAssetFields = require('../utils/buildAssetFields');

module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsFileField',
      extensions: { infer: false },
      fields: {
        ...buildAssetFields(),
        alt: 'String',
        title: 'String',
        customData: 'JSON',
      },
    }),
  ]);
};
