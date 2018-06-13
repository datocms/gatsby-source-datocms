const mId = require('./makeId');
const makeType = require('./makeType');

module.exports = function initNodeFromEntity(entity, locale = null) {
  return {
    id: mId(entity, locale),
    originalId: entity.id,
    parent: null,
    children: [],
    internal: {
      type: makeType(entity),
    },
  };
}
