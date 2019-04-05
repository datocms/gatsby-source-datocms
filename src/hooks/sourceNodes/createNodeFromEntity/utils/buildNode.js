const updateDigest = require('./updateDigest');

module.exports = (type, id, cb) => {
  const node = {
    id: `${type}-${id}`,
    parent: null,
    children: [],
    internal: { type: type },
  };

  cb(node);

  return updateDigest(node);
};
