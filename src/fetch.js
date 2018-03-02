const EntitiesRepo = require('datocms-client/lib/local/EntitiesRepo');

module.exports = function(client, draftMode) {
  return Promise.all([
    client.get('/site', { include: 'item_types,item_types.fields' }),
    client.items.all({ version: draftMode ? 'current' : 'published' }, { deserializeResponse: false, allPages: true }),
  ])
  .then(([site, allItems]) => {
    return new EntitiesRepo(site, allItems);
  });
}
