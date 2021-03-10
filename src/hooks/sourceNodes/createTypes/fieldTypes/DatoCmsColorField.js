const toHex = require('../utils/toHex');

module.exports = ({ actions, schema }) => {
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

            return `rgba(${parent.red}, ${parent.green}, ${parent.blue}, ${parent.alpha})`;
          },
        },
        hex: {
          type: 'String',
          resolve: toHex,
        },
      },
    }),
  ]);
};
