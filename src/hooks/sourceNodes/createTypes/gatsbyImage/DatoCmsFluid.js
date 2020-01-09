const getBase64 = require('../utils/getBase64');
const getTracedSVG = require('../utils/getTracedSVG');

module.exports = ({ actions, schema, store, cacheDir }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsFluid',
      extensions: { infer: false },
      fields: {
        base64: {
          type: 'String',
          resolve: image => getBase64(image, cacheDir),
        },
        tracedSVG: {
          type: 'String',
          resolve: image => getTracedSVG(image, cacheDir),
        },
        aspectRatio: 'Float!',
        width: 'Int',
        height: 'Int',
        src: 'String!',
        srcSet: 'String!',
        sizes: 'String!',
      },
    }),
  ]);
};
