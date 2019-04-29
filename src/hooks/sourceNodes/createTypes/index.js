const item = require('./item');
const upload = require('./upload');

module.exports = (context) => {
  [item, upload].forEach(fn => fn(context));
};
