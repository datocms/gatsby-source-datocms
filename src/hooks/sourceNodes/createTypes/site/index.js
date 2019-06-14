module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsSite',
      extensions: { infer: false },
      fields: {
        name: 'String',
        locale: 'String',
        locales: '[String]',
        domain: 'String',
        internalDomain: 'String',
        noIndex: 'Boolean',
        globalSeo: 'DatoCmsGlobalSeo',
        faviconMetaTags: {
          type: 'DatoCmsFaviconMetaTags',
          extensions: {
            link: { to: 'id', from: 'faviconMetaTags___NODE' },
          },
        },
        originalId: 'String',
      },
      interfaces: ['Node'],
    }),
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
    schema.buildObjectType({
      name: 'DatoCmsFaviconMetaTags',
      extensions: { infer: false },
      fields: {
        tags: 'JSON',
      },
      interfaces: [`Node`],
    }),
  ]);
};
