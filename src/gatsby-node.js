require('core-js/stable');
require('regenerator-runtime/runtime');

const onPreInit = require('./hooks/onPreInit')
exports.onPreInit = onPreInit;

const createSchemaCustomization = require('./hooks/createSchemaCustomization');
exports.createSchemaCustomization = createSchemaCustomization;

const sourceNodes = require('./hooks/sourceNodes');
exports.sourceNodes = sourceNodes;
