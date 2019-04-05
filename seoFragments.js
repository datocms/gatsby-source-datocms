'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _templateObject = _taggedTemplateLiteral(['\n  fragment GatsbyDatoCmsSeoMetaTags on DatoCmsSeoMetaTags {\n    tags {\n      tagName\n      content\n      attributes {\n        property\n        content\n        name\n      }\n    }\n  }\n'], ['\n  fragment GatsbyDatoCmsSeoMetaTags on DatoCmsSeoMetaTags {\n    tags {\n      tagName\n      content\n      attributes {\n        property\n        content\n        name\n      }\n    }\n  }\n']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _require = require('gatsby'),
    graphql = _require.graphql;

var datoCmsSeoMetaTags = exports.datoCmsSeoMetaTags = graphql(_templateObject);