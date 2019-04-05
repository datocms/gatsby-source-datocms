'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _require = require('graphql'),
    GraphQLInputObjectType = _require.GraphQLInputObjectType,
    GraphQLObjectType = _require.GraphQLObjectType,
    GraphQLBoolean = _require.GraphQLBoolean,
    GraphQLString = _require.GraphQLString,
    GraphQLInt = _require.GraphQLInt,
    GraphQLFloat = _require.GraphQLFloat,
    GraphQLEnumType = _require.GraphQLEnumType;

var GraphQLJSONType = require('graphql-type-json');
var queryString = require('query-string');
var md5 = require('md5');
var path = require('path');
var imgixParams = require('imgix-url-params/dist/parameters');

var _require2 = require('humps'),
    decamelizeKeys = _require2.decamelizeKeys,
    camelize = _require2.camelize,
    pascalize = _require2.pascalize;

var fs = require('fs');
var Queue = require('promise-queue');
var request = require('request-promise-native');
var getExtractedSVG = require('svg-inline-loader').getExtractedSVG;
var objectEntries = require('object.entries');
var objectAssign = require('object-assign');

var isImage = function isImage(_ref) {
  var format = _ref.format,
      width = _ref.width,
      height = _ref.height;
  return ['png', 'jpg', 'jpeg', 'gif'].includes(format) && width && height;
};

var isSvg = function isSvg(_ref2) {
  var format = _ref2.format,
      width = _ref2.width,
      height = _ref2.height;
  return format === 'svg';
};

var createUrl = function createUrl() {
  var image = arguments[0];
  var options = decamelizeKeys(objectAssign.apply(null, [{}].concat(Array.prototype.slice.call(arguments, 1))), { separator: '-' });

  return image.url + '?' + queryString.stringify(options);
};

var queue = new Queue(3, Infinity);

var getImage = function getImage(image, cacheDir) {
  var requestUrl = image.url;
  var cacheFile = path.join(cacheDir, md5(requestUrl));

  if (fs.existsSync(cacheFile)) {
    var body = fs.readFileSync(cacheFile, 'utf8');
    return Promise.resolve(body);
  }

  return request(image.url).then(function (body) {
    var prefix = 'prefix-' + md5(image.url) + '-';

    var fixedBody = getExtractedSVG(body, { classPrefix: prefix, idPrefix: prefix }).replace(/url\(#/g, 'url(#' + prefix);

    fs.writeFileSync(cacheFile, fixedBody, 'utf8');
    return body;
  });
};

var getBase64Image = function getBase64Image(requestUrl, cacheDir) {
  var cacheFile = path.join(cacheDir, md5(requestUrl));

  if (fs.existsSync(cacheFile)) {
    var body = fs.readFileSync(cacheFile, 'utf8');
    return Promise.resolve(body);
  }

  return queue.add(function () {
    return request({
      uri: requestUrl,
      resolveWithFullResponse: true,
      encoding: 'base64'
    }).then(function (res) {
      var data = 'data:' + res.headers['content-type'] + ';base64,' + res.body;
      fs.writeFileSync(cacheFile, data, 'utf8');
      return data;
    });
  });
};

var getBase64ImageAndBasicMeasurements = function getBase64ImageAndBasicMeasurements(image, args, cacheDir) {
  var argsWidth = args.width || args.maxWidth;
  var argsHeight = args.height || args.maxHeight;
  var originalAspectRatio = image.width / image.height;

  var height = void 0;
  var width = void 0;

  if (argsWidth) {
    width = argsWidth;

    if (argsHeight) {
      height = argsHeight;
    } else {
      height = width / originalAspectRatio;
    }
  } else if (argsHeight) {
    height = argsHeight;

    if (argsWidth) {
      width = argsWidth;
    } else {
      width = height * originalAspectRatio;
    }
  }

  var aspectRatio = width / height;
  var previewUrl = void 0;

  if (width > height) {
    previewUrl = createUrl(image, args.imgixParams, { fit: 'crop', w: 20, h: parseInt(20.0 / aspectRatio) });
  } else {
    previewUrl = createUrl(image, args.imgixParams, { fit: 'crop', h: 20, w: parseInt(20.0 * aspectRatio) });
  }

  return getBase64Image(previewUrl, cacheDir).then(function (base64Str) {
    return {
      base64Str: base64Str,
      aspectRatio: aspectRatio,
      width: width,
      height: height
    };
  });
};

var resolveInlineSvg = function resolveInlineSvg(image, options, cacheDir) {
  if (!isSvg(image)) return null;
  return getImage(image, cacheDir);
};

var resolveResolution = function resolveResolution(image, options, cacheDir) {
  if (!isImage(image)) return null;

  return getBase64ImageAndBasicMeasurements(image, options, cacheDir).then(function (_ref3) {
    var base64Str = _ref3.base64Str,
        width = _ref3.width,
        height = _ref3.height,
        aspectRatio = _ref3.aspectRatio;


    // Create sizes (in width) for the image. If the width of the
    // image is 800px, the sizes would then be: 800, 1200, 1600,
    // 2400.
    //
    // This is enough sizes to provide close to the optimal image size for every
    // device size / screen resolution
    var sizes = [];
    sizes.push(options.width);
    sizes.push(options.width * 1.5);
    sizes.push(options.width * 2);
    sizes.push(options.width * 3);
    sizes = sizes.map(Math.round);

    // Create the srcSet
    var srcSet = sizes.filter(function (size) {
      return size < image.width;
    }).map(function (size, i) {
      var resolution = void 0;
      switch (i) {
        case 0:
          resolution = '1x';
          break;
        case 1:
          resolution = '1.5x';
          break;
        case 2:
          resolution = '2x';
          break;
        case 3:
          resolution = '3x';
          break;
        default:
      }
      var h = Math.round(size / aspectRatio);
      var url = createUrl(image, options.imgixParams, { w: size, h: h, fit: 'crop' });
      return url + ' ' + resolution;
    }).join(',\n');

    var pickedHeight = void 0;

    if (options.height) {
      pickedHeight = options.height;
    } else {
      pickedHeight = options.width / aspectRatio;
    }

    return {
      base64: base64Str,
      aspectRatio: aspectRatio,
      width: Math.round(options.width),
      height: Math.round(pickedHeight),
      src: createUrl(image, options.imgixParams, { w: options.width }),
      srcSet: srcSet
    };
  });
};

var resolveSizes = function resolveSizes(image, options, cacheDir) {
  if (!isImage(image)) return null;

  return getBase64ImageAndBasicMeasurements(image, options, cacheDir).then(function (_ref4) {
    var base64Str = _ref4.base64Str,
        width = _ref4.width,
        height = _ref4.height,
        aspectRatio = _ref4.aspectRatio;


    if (!options.maxWidth) {
      options.maxWidth = options.maxHeight * aspectRatio;
    }

    // If the users didn't set a default sizes, we'll make one.
    if (!options.sizes) {
      options.sizes = '(max-width: ' + options.maxWidth + 'px) 100vw, ' + options.maxWidth + 'px';
    }

    // Create sizes (in width) for the image. If the max width of the container
    // for the rendered markdown file is 800px, the sizes would then be: 200,
    // 400, 800, 1200, 1600, 2400.
    //
    // This is enough sizes to provide close to the optimal image size for every
    // device size / screen resolution
    var sizes = [];
    sizes.push(options.maxWidth / 4);
    sizes.push(options.maxWidth / 2);
    sizes.push(options.maxWidth);
    sizes.push(options.maxWidth * 1.5);
    sizes.push(options.maxWidth * 2);
    sizes.push(options.maxWidth * 3);
    sizes = sizes.map(Math.round);

    // Filter out sizes larger than the image's maxWidth.
    var filteredSizes = sizes.filter(function (size) {
      return size < image.width;
    });

    // Add the original image to ensure the largest image possible
    // is available for small images.
    filteredSizes.push(width);

    // Create the srcSet.
    var srcSet = filteredSizes.map(function (width) {
      var h = Math.round(width / aspectRatio);
      var url = createUrl(image, options.imgixParams, { fit: 'crop', w: width, h: h });
      return url + ' ' + Math.round(width) + 'w';
    }).join(',\n');

    return {
      base64: base64Str,
      aspectRatio: aspectRatio,
      src: createUrl(image, options.imgixParams, { w: options.maxWidth, h: options.maxWidth / aspectRatio }),
      srcSet: srcSet,
      sizes: options.sizes
    };
  });
};

module.exports = function extendAssetNode(_ref5) {
  var cacheDir = _ref5.cacheDir;


  var fields = {};
  var mappings = {
    boolean: GraphQLBoolean,
    hex_color: GraphQLString,
    integer: GraphQLInt,
    list: GraphQLString,
    number: GraphQLFloat,
    path: GraphQLString,
    string: GraphQLString,
    timestamp: GraphQLString,
    unit_scalar: GraphQLFloat,
    url: GraphQLString
  };

  objectEntries(imgixParams.parameters).forEach(function (_ref6) {
    var _ref7 = _slicedToArray(_ref6, 2),
        param = _ref7[0],
        doc = _ref7[1];

    fields[camelize(param)] = {
      type: doc.expects.length === 1 ? mappings[doc.expects[0].type] : GraphQLString,
      description: doc.short_description + ' (' + doc.url + ')'
    };
  });

  var ImgixParamsType = new GraphQLInputObjectType({
    name: 'DatoCmsImgixParams',
    fields: fields
  });

  var extension = {
    resolutions: {
      type: new GraphQLObjectType({
        name: 'DatoCmsFixed',
        fields: {
          base64: { type: GraphQLString },
          aspectRatio: { type: GraphQLFloat },
          width: { type: GraphQLFloat },
          height: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString }
        }
      }),
      args: {
        width: {
          type: GraphQLInt,
          defaultValue: 400
        },
        height: {
          type: GraphQLInt
        },
        imgixParams: {
          type: ImgixParamsType
        }
      },
      resolve: function resolve(image, options, context) {
        return resolveResolution(image, options, cacheDir);
      }
    },
    sizes: {
      type: new GraphQLObjectType({
        name: 'DatoCmsFluid',
        fields: {
          base64: { type: GraphQLString },
          aspectRatio: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
          sizes: { type: GraphQLString }
        }
      }),
      args: {
        maxWidth: {
          type: GraphQLInt,
          defaultValue: 800
        },
        maxHeight: {
          type: GraphQLInt
        },
        sizes: {
          type: GraphQLString
        },
        imgixParams: {
          type: ImgixParamsType
        }
      },
      resolve: function resolve(image, options, context) {
        return resolveSizes(image, options, cacheDir);
      }
    },
    inlineSvg: {
      type: GraphQLString,
      resolve: function resolve(image, options, context) {
        return resolveInlineSvg(image, options, cacheDir);
      }
    }
  };

  extension.fluid = extension.sizes;
  extension.fixed = extension.resolutions;

  return extension;
};