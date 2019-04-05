const item = require('./item');

module.exports = (context) => {
  [item].forEach(fn => fn(context));
};
