const EntitiesRepo = require('datocms-client/lib/local/EntitiesRepo');

module.exports = function(client) {
  return Promise.all([
    this.client.get('/site', { include: 'item_types,item_types.fields' }),
    this.client.items.all({}, { deserializeResponse: false, allPages: true }),
  ])
  .then(([site, allItems]) => {
    return new EntitiesRepo(site, allItems);
  });
}
