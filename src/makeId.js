const makeType = require('./makeType');

module.exports = function makeId(entity, locale = null) {
  let id = makeType(entity);

  id += `-${entity.id}`;

  if (locale) {
    id += `-${locale}`;
  }

  return id;
}
