'use strict';

var mId = require('./makeId');
var makeType = require('./makeType');

module.exports = function initNodeFromEntity(entity) {
  var locale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  return {
    id: mId(entity, locale),
    originalId: entity.id,
    parent: null,
    children: [],
    internal: {
      type: makeType(entity)
    }
  };
};