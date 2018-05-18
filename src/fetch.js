const EntitiesRepo = require('datocms-client/lib/local/EntitiesRepo');

module.exports = function(client, previewMode) {
  return Promise.all([
    client.get('/site', { include: 'item_types,item_types.fields' }),
    client.items.all({ version: previewMode ? 'latest' : 'published' }, { deserializeResponse: false, allPages: true }),
    client.uploads.all({ version: previewMode ? 'latest' : 'published' }, { deserializeResponse: false, allPages: true }),
  ])
  .then(([site, allItems]) => {
    return new EntitiesRepo(site, allItems);
  });
}
