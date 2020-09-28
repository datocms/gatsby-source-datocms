const dateType = {
  type: 'Date',
  extensions: { dateformat: {}, proxy: {} },
};

module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsMetaField',
      extensions: { infer: false },
      fields: {
        createdAt: dateType,
        updatedAt: dateType,
        publishedAt: dateType,
        firstPublishedAt: dateType,
        isValid: 'Boolean',
        status: 'String',
      },
    }),
  ]);
};
