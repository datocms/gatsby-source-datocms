'use strict';

var _require = require('humps'),
    pascalize = _require.pascalize;

module.exports = function (entity) {
  var type = 'DatoCms';

  if (entity.type === 'item') {
    type += pascalize(entity.itemType.apiKey);
  } else if (entity.type === 'item_type') {
    type += 'Model';
  } else {
    type += pascalize(entity.type);
  }

  return type;
};