const item = require('./item');
const upload = require('./upload');
const site = require('./site');
const schema = require('./schema');
const gatsbyImage = require('./gatsbyImage');
const fieldTypes = require('./fieldTypes');

module.exports = context => {
  [gatsbyImage, fieldTypes, item, upload, site, schema].forEach(fn =>
    fn(context),
  );
};
