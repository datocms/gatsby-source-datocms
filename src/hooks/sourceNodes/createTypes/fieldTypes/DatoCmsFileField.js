const {
  addRemoteFilePolyfillInterface,
} = require('gatsby-plugin-utils/polyfill-remote-file');

const buildAssetFields = require('../utils/buildAssetFields');

module.exports = ({ actions, schema, cache }) => {
  actions.createTypes([
    addRemoteFilePolyfillInterface(
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
        interfaces: ['RemoteFile'],
      }),
      {
        schema,
        actions,
      },
    ),
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
