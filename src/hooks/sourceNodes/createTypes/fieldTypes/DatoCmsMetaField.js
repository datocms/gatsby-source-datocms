const dateType = {
  type: 'Date',
  extensions: { dateformat: {} },
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
        unpublishingScheduledAt: dateType,
        isValid: 'Boolean',
        status: 'String',
      },
    }),
  ]);
};
