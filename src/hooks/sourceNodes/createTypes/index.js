const item = require('./item');
const upload = require('./upload');
const site = require('./site');
const itemType = require('./itemType');
const field = require('./field');

module.exports = context => {
  [item, upload, site, itemType, field].forEach(fn => fn(context));
};
