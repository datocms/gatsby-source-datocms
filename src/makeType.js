const { pascalize } = require('humps');

module.exports = function(entity) {
  let type = 'DatoCms';

  if (entity.type === 'item') {
    type += pascalize(entity.itemType.apiKey);
  } else if (entity.type === 'item_type') {
    type += 'Model';
  } else {
    type += pascalize(entity.type);
  }

  return type;
}
