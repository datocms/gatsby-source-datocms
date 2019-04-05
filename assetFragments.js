'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _templateObject = _taggedTemplateLiteral(['\n  fragment GatsbyDatoCmsResolutions on DatoCmsFixed {\n    base64\n    width\n    height\n    src\n    srcSet\n  }\n'], ['\n  fragment GatsbyDatoCmsResolutions on DatoCmsFixed {\n    base64\n    width\n    height\n    src\n    srcSet\n  }\n']),
    _templateObject2 = _taggedTemplateLiteral(['\n  fragment GatsbyDatoCmsResolutions_noBase64 on DatoCmsFixed {\n    width\n    height\n    src\n    srcSet\n  }\n'], ['\n  fragment GatsbyDatoCmsResolutions_noBase64 on DatoCmsFixed {\n    width\n    height\n    src\n    srcSet\n  }\n']),
    _templateObject3 = _taggedTemplateLiteral(['\n  fragment GatsbyDatoCmsSizes on DatoCmsFluid {\n    base64\n    aspectRatio\n    src\n    srcSet\n    sizes\n  }\n'], ['\n  fragment GatsbyDatoCmsSizes on DatoCmsFluid {\n    base64\n    aspectRatio\n    src\n    srcSet\n    sizes\n  }\n']),
    _templateObject4 = _taggedTemplateLiteral(['\n  fragment GatsbyDatoCmsSizes_noBase64 on DatoCmsFluid {\n    aspectRatio\n    src\n    srcSet\n    sizes\n  }\n'], ['\n  fragment GatsbyDatoCmsSizes_noBase64 on DatoCmsFluid {\n    aspectRatio\n    src\n    srcSet\n    sizes\n  }\n']),
    _templateObject5 = _taggedTemplateLiteral(['\n  fragment GatsbyDatoCmsFixed on DatoCmsFixed {\n    base64\n    width\n    height\n    src\n    srcSet\n  }\n'], ['\n  fragment GatsbyDatoCmsFixed on DatoCmsFixed {\n    base64\n    width\n    height\n    src\n    srcSet\n  }\n']),
    _templateObject6 = _taggedTemplateLiteral(['\n  fragment GatsbyDatoCmsFixed_noBase64 on DatoCmsFixed {\n    width\n    height\n    src\n    srcSet\n  }\n'], ['\n  fragment GatsbyDatoCmsFixed_noBase64 on DatoCmsFixed {\n    width\n    height\n    src\n    srcSet\n  }\n']),
    _templateObject7 = _taggedTemplateLiteral(['\n  fragment GatsbyDatoCmsFluid on DatoCmsFluid {\n    base64\n    aspectRatio\n    src\n    srcSet\n    sizes\n  }\n'], ['\n  fragment GatsbyDatoCmsFluid on DatoCmsFluid {\n    base64\n    aspectRatio\n    src\n    srcSet\n    sizes\n  }\n']),
    _templateObject8 = _taggedTemplateLiteral(['\n  fragment GatsbyDatoCmsFluid_noBase64 on DatoCmsFluid {\n    aspectRatio\n    src\n    srcSet\n    sizes\n  }\n'], ['\n  fragment GatsbyDatoCmsFluid_noBase64 on DatoCmsFluid {\n    aspectRatio\n    src\n    srcSet\n    sizes\n  }\n']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _require = require('gatsby'),
    graphql = _require.graphql;

var datoCmsAssetResolutions = exports.datoCmsAssetResolutions = graphql(_templateObject);

var datoCmsAssetResolutionsNoBase64 = exports.datoCmsAssetResolutionsNoBase64 = graphql(_templateObject2);

var datoCmsAssetSizes = exports.datoCmsAssetSizes = graphql(_templateObject3);

var datoCmsAssetSizesNoBase64 = exports.datoCmsAssetSizesNoBase64 = graphql(_templateObject4);

var datoCmsAssetFixed = exports.datoCmsAssetFixed = graphql(_templateObject5);

var datoCmsAssetFixedNoBase64 = exports.datoCmsAssetFixedNoBase64 = graphql(_templateObject6);

var datoCmsAssetFluid = exports.datoCmsAssetFluid = graphql(_templateObject7);

var datoCmsAssetFluidNoBase64 = exports.datoCmsAssetFluidNoBase64 = graphql(_templateObject8);