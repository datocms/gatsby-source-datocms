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
  ]);
};
