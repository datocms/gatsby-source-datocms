const EntitiesRepo = require('datocms-client/lib/local/EntitiesRepo');

module.exports = function(client) {
  return Promise.all([
    client.get('/site', { include: 'item_types,item_types.fields' }),
    client.items.all({}, false),
  ])
  .then(([site, allItems]) => {
    return new EntitiesRepo(site, allItems);
  });
}
