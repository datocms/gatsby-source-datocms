const buildNode = require('../utils/buildNode');
const buildFaviconMetaTagsNode = require('./buildFaviconMetaTagsNode');
const objectAssign = require('object-assign');
const { localizedRead } = require('datocms-client');

module.exports = function buildSiteNode(
  entity,
  { entitiesRepo, localeFallbacks },
) {
  return [].concat(
    ...entity.locales.map(locale => {
      const additionalNodesToCreate = [];
      const i18n = { locale, fallbacks: localeFallbacks };

      const siteNode = buildNode(
        'DatoCmsSite',
        `${entity.id}-${locale}`,
        node => {
          node.locale = locale;

          ['name', 'locales', 'domain', 'internalDomain', 'noIndex'].forEach(
            key => (node[key] = entity[key]),
          );

          const globalSeo = localizedRead(
            entity,
            'globalSeo',
            entity.locales.length > 1,
            i18n,
          );

          if (globalSeo) {
            node.globalSeo = objectAssign({}, globalSeo);

            if (globalSeo.fallbackSeo) {
              node.globalSeo.fallbackSeo = {
                title: node.globalSeo.fallbackSeo.title,
                description: node.globalSeo.fallbackSeo.description,
                twitterCard: node.globalSeo.fallbackSeo.twitterCard,
                image___NODE:
                  node.globalSeo.fallbackSeo.image &&
                  `DatoCmsAsset-${node.globalSeo.fallbackSeo.image}`,
              };
            }
          }

          if (entity.favicon) {
            const faviconNode = buildFaviconMetaTagsNode(node, entitiesRepo);
            additionalNodesToCreate.push(faviconNode);
            node.faviconMetaTags___NODE = faviconNode.id;
            node.children = node.children.concat([faviconNode.id]);
          }

          node.originalId = entity.id;
        },
      );

      return [siteNode].concat(additionalNodesToCreate);
    }),
  );
};
