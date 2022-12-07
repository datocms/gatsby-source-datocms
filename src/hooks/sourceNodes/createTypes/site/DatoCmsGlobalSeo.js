const { camelizeKeys } = require('datocms-client');

const resolveUsingAttribute = (key, definition) => ({
  ...definition,
  resolve: node => {
    return node[key];
  },
});

module.exports = ({ actions, schema, generateType }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: generateType('GlobalSeo'),
      extensions: { infer: false },
      fields: {
        siteName: resolveUsingAttribute('site_name', { type: 'String' }),
        titleSuffix: resolveUsingAttribute('title_suffix', { type: 'String' }),
        twitterAccount: resolveUsingAttribute('twitter_account', {
          type: 'String',
        }),
        facebookPageUrl: resolveUsingAttribute('facebook_page_url', {
          type: 'String',
        }),
        fallbackSeo: {
          type: generateType('SeoField'),
          resolve: node => {
            const result = camelizeKeys(node.fallback_seo);
            return result;
          },
        },
      },
    }),
  ]);
};
