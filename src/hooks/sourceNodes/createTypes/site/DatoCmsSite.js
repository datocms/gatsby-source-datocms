const { localizedRead } = require('datocms-client');

function getI18n(args, context, info, mainLocale) {
  if (args.locale) {
    context.sourceDatocms
      .getQueryContext(context)
      .localeState.set(info, args.locale);
  }

  if (args.fallbackLocales) {
    context.sourceDatocms
      .getQueryContext(context)
      .fallbackLocalesState.set(info, args.fallbackLocales);
  }

  const locale =
    context.sourceDatocms.getQueryContext(context).localeState.get(info) ||
    mainLocale;

  return {
    locale,
    fallbacks: {
      [locale]:
        context.sourceDatocms
          .getQueryContext(context)
          .fallbackLocalesState.get(info) || [],
    },
  };
}

const resolveUsingEntityPayloadAttribute = (
  key,
  definition,
  camelize = false,
) => ({
  ...definition,
  resolve: node => {
    return camelize
      ? camelizeKeys(node.entityPayload.attributes[key])
      : node.entityPayload.attributes[key];
  },
});

module.exports = ({ actions, schema, generateType }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: generateType('Site'),
      extensions: { infer: false },
      fields: {
        name: resolveUsingEntityPayloadAttribute('name', { type: 'String' }),
        locales: resolveUsingEntityPayloadAttribute('locales', {
          type: '[String!]!',
        }),
        domain: resolveUsingEntityPayloadAttribute('domain', {
          type: 'String',
        }),
        internalDomain: resolveUsingEntityPayloadAttribute('internal_domain', {
          type: 'String!',
        }),
        noIndex: resolveUsingEntityPayloadAttribute('no_index', {
          type: 'Boolean',
        }),
        globalSeo: {
          type: generateType('GlobalSeo'),
          args: {
            locale: `String`,
            fallbackLocales: `[String!]`,
          },
          resolve: (node, args, context, info) => {
            const i18n = getI18n(
              args,
              context,
              info,
              node.entityPayload.attributes.locales[0],
            );

            const result = localizedRead(
              node.entityPayload.attributes,
              'global_seo',
              node.entityPayload.attributes.locales.length > 1,
              i18n,
            );

            return result;
          },
        },
        faviconMetaTags: {
          type: 'DatoCmsFaviconMetaTags',
          resolve: node => {
            return node.faviconMetaTags;
          },
        },
        originalId: { type: 'String!', resolve: node => node.entityPayload.id },
      },
      interfaces: ['Node'],
    }),
  ]);
};
