require('core-js/stable');
require('regenerator-runtime/runtime');

const createSchemaCustomization = require('./hooks/createSchemaCustomization');
exports.createSchemaCustomization = createSchemaCustomization;

const sourceNodes = require('./hooks/sourceNodes');
exports.sourceNodes = sourceNodes;
