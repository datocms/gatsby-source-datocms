module.exports = function addEntityAttributes(node, entity) {
  Object.entries(entity.payload.attributes || {}).forEach(([name, value]) => {
    node[name] = value;
  });
}


