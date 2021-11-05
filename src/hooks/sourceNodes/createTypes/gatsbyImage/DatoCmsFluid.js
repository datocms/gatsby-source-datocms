const getBase64 = require('../utils/getBase64');
const getTracedSVG = require('../utils/getTracedSVG');

module.exports = ({ actions, schema, store, cache }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsFluid',
      extensions: { infer: false },
      fields: {
        base64: {
          type: 'String',
          resolve: image => getBase64(image, cache),
        },
        tracedSVG: {
          type: 'String',
          resolve: image => getTracedSVG(image, cache),
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
