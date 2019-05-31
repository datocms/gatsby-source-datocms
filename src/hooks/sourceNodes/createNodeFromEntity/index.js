const buildItemTypeNode = require('./itemType');
const buildFieldNode = require('./field');
const buildUploadNode = require('./upload');
const buildItemNode = require('./item');
const buildSiteNode = require('./site');

const BUILDERS = {
  item_type: buildItemTypeNode,
  field: buildFieldNode,
  upload: buildUploadNode,
  item: buildItemNode,
  site: buildSiteNode,
};

module.exports = (entity, context) => {
  if (!BUILDERS[entity.type]) {
    console.log(`Don't know how to build entity of type '${entity.type}'!`);
    return;
  }

  const result = BUILDERS[entity.type](entity, context);
  const nodesToCreate = Array.isArray(result) ? result : [result];

  nodesToCreate.map(node => {
    context.actions.createNode(node);
  });
};
