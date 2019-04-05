require('babel-polyfill');

const sourceNodes = require('./hooks/sourceNodes');
exports.sourceNodes = sourceNodes;

const onPreExtractQueries = require('./hooks/onPreExtractQueries');
exports.onPreExtractQueries = onPreExtractQueries;

const setFieldsOnGraphQLNodeType = require('./hooks/setFieldsOnGraphQLNodeType');
exports.setFieldsOnGraphQLNodeType = setFieldsOnGraphQLNodeType;
