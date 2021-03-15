const buildNode = require('../utils/buildNode');
const buildFaviconMetaTagsNode = require('./buildFaviconMetaTagsNode');
const objectAssign = require('object-assign');
const { localizedRead } = require('datocms-client');

module.exports = function buildSiteNode(
  entity,
  { entitiesRepo, localeFallbacks, generateType },
) {
  return [].concat(
    ...entity.locales.map(locale => {
      const additionalNodesToCreate = [];
      const i18n = { locale, fallbacks: localeFallbacks };

      const siteNode = buildNode(
        generateType('Site'),
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
                image: node.globalSeo.fallbackSeo.image,
              };
            }
          }

          if (entity.favicon) {
            const faviconNode = buildFaviconMetaTagsNode(node, entitiesRepo);
            additionalNodesToCreate.push(faviconNode);
            node.faviconMetaTags___NODE = faviconNode.id;
          }

          node.originalId = entity.id;
        },
      );

      return [siteNode].concat(additionalNodesToCreate);
    }),
  );
};
