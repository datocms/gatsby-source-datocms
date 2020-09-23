module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsLatLonField',
      extensions: { infer: false },
      fields: {
        latitude: 'Float',
        longitude: 'Float',
      },
    }),
  ]);
};
