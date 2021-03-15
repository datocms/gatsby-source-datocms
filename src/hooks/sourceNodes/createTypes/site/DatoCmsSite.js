module.exports = ({ actions, schema, generateType }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: generateType('Site'),
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
            link: { by: 'id', from: 'faviconMetaTags___NODE' },
          },
        },
        originalId: 'String',
      },
      interfaces: ['Node'],
    }),
  ]);
};
