const Site = require('datocms-client/lib/local/Site');
const initNodeFromEntity = require('./initNodeFromEntity');
const addDigestToNode = require('./addDigestToNode');
const addEntityAttributes = require('./addEntityAttributes');
const i18n = require('datocms-client/lib/utils/i18n');

module.exports = function(repo, createNode) {
  const siteEntity = repo.findEntitiesOfType('site')[0];
  const site = new Site(siteEntity);

  i18n.availableLocales = site.locales;

  site.locales.forEach(locale => {
    i18n.locale = locale;

    let node = initNodeFromEntity(siteEntity, locale);
    node = Object.assign(site.toMap(), node);
    node.locale = locale;
    addDigestToNode(node);
    createNode(node);
  });
}
