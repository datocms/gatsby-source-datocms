module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsGlobalSeo',
      extensions: { infer: false },
      fields: {
        siteName: 'String',
        titleSuffix: 'String',
        twitterAccount: 'String',
        facebookPageUrl: 'String',
        fallbackSeo: 'DatoCmsSeoField',
      },
    }),
  ]);
};
