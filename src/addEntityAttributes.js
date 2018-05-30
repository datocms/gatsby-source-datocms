const objectEntries =  require('object.entries');

module.exports = function addEntityAttributes(node, entity) {
  objectEntries(entity.payload.attributes || {}).forEach(([name, value]) => {
    node[name] = value;
  });
}
