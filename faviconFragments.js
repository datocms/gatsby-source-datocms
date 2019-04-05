'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _templateObject = _taggedTemplateLiteral(['\n  fragment GatsbyDatoCmsFaviconMetaTags on DatoCmsFaviconMetaTags {\n    tags {\n      tagName\n      attributes {\n        rel\n        sizes\n        href\n        name\n        content\n        type\n      }\n    }\n  }\n'], ['\n  fragment GatsbyDatoCmsFaviconMetaTags on DatoCmsFaviconMetaTags {\n    tags {\n      tagName\n      attributes {\n        rel\n        sizes\n        href\n        name\n        content\n        type\n      }\n    }\n  }\n']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _require = require('gatsby'),
    graphql = _require.graphql;

var datoCmsFaviconMetaTags = exports.datoCmsFaviconMetaTags = graphql(_templateObject);