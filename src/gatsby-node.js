require('core-js/stable');
require('regenerator-runtime/runtime');

const sourceNodes = require('./hooks/sourceNodes');
exports.sourceNodes = sourceNodes;

const onPreExtractQueries = require('./hooks/onPreExtractQueries');
exports.onPreExtractQueries = onPreExtractQueries;
