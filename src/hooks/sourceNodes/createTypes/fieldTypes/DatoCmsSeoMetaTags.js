module.exports = ({ actions, schema, generateType }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: generateType('SeoMetaTags'),
      extensions: { infer: false },
      fields: {
        tags: {
          type: 'JSON',
        },
      },
    }),
  ]);
};
