const { GraphQLInputObjectType, GraphQLObjectType, GraphQLBoolean, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLEnumType } = require('graphql');
const GraphQLJSONType = require('graphql-type-json');
const queryString = require('query-string');
const md5 = require('md5');
const path = require('path');
const imgixParams = require('imgix-url-params/dist/parameters');
const { decamelizeKeys, camelize, pascalize } = require('humps');
const fs = require('fs');
const Queue = require('promise-queue');
const request = require('request-promise-native');
const getExtractedSVG = require('svg-inline-loader').getExtractedSVG;
const objectEntries =  require('object.entries');
const objectAssign =require('object-assign');

const isImage = ({ format, width, height }) => (
  ['png', 'jpg', 'jpeg', 'gif'].includes(format) && width && height
);

const isSvg = ({ format, width, height }) => format === 'svg';

const createUrl = function() {
  const image = arguments[0];
  const options = decamelizeKeys(
    objectAssign.apply(
      null,
      [{}].concat(Array.prototype.slice.call(arguments, 1))
    ),
    { separator: '-' }
  );

  return `${image.url}?${queryString.stringify(options)}`;
}

const queue = new Queue(3, Infinity);

const getImage = (image, cacheDir) => {
  const requestUrl = image.url;
  const cacheFile = path.join(cacheDir, md5(requestUrl));

  if (fs.existsSync(cacheFile)) {
    const body = fs.readFileSync(cacheFile, 'utf8');
    return Promise.resolve(body);
  }

  return request(image.url)
  .then((body) => {
    const prefix = `prefix-${md5(image.url)}-`;

    const fixedBody = getExtractedSVG(
      body,
      { classPrefix: prefix, idPrefix: prefix }
    ).replace(/url\(#/g, `url(#${prefix}`);

    fs.writeFileSync(cacheFile, fixedBody, 'utf8');
    return body;
  });
}

const getBase64Image = (requestUrl, cacheDir) => {
  const cacheFile = path.join(cacheDir, md5(requestUrl));

  if (fs.existsSync(cacheFile)) {
    const body = fs.readFileSync(cacheFile, 'utf8');
    return Promise.resolve(body);
  }

  return queue.add(() => {
    return request({
      uri: requestUrl,
      resolveWithFullResponse: true,
      encoding: 'base64'
    }).then(res => {
      const data = 'data:' + res.headers['content-type'] + ';base64,' + res.body;
      fs.writeFileSync(cacheFile, data, 'utf8');
      return data;
    });
  });
}

const getBase64ImageAndBasicMeasurements = (image, args, cacheDir) => {
  const argsWidth = args.width || args.maxWidth;
  const argsHeight = args.height || args.maxHeight;
  const originalAspectRatio = image.width / image.height;

  let height;
  let width;

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

  const aspectRatio = width / height;
  let previewUrl;

  if (width > height) {
    previewUrl = createUrl(
      image,
      args.imgixParams,
      { fit: 'crop', w: 20, h: parseInt(20.0 / aspectRatio) }
    );
  } else {
    previewUrl = createUrl(
      image,
      args.imgixParams,
      { fit: 'crop', h: 20, w: parseInt(20.0 * aspectRatio) }
    );
  }

  return getBase64Image(previewUrl, cacheDir).then(base64Str => {
    return {
      base64Str,
      aspectRatio,
      width,
      height,
    };
  })
};

const resolveInlineSvg = (image, options, cacheDir) => {
  if (!isSvg(image)) return null;
  return getImage(image, cacheDir);
}

const resolveResolution = (image, options, cacheDir) => {
  if (!isImage(image)) return null;

  return getBase64ImageAndBasicMeasurements(image, options, cacheDir).then(
    ({ base64Str, width, height, aspectRatio }) => {

      // Create sizes (in width) for the image. If the width of the
      // image is 800px, the sizes would then be: 800, 1200, 1600,
      // 2400.
      //
      // This is enough sizes to provide close to the optimal image size for every
      // device size / screen resolution
      let sizes = [];
      sizes.push(options.width);
      sizes.push(options.width * 1.5);
      sizes.push(options.width * 2);
      sizes.push(options.width * 3);
      sizes = sizes.map(Math.round);

      // Create the srcSet
      const srcSet = sizes
      .filter(size => size < image.width)
      .map((size, i) => {
        let resolution
        switch (i) {
          case 0:
            resolution = `1x`
          break
          case 1:
            resolution = `1.5x`
          break
          case 2:
            resolution = `2x`
          break
          case 3:
            resolution = `3x`
          break
          default:
        }
          const h = Math.round(size / aspectRatio);
          const url = createUrl(
            image,
            options.imgixParams,
            { w: size, h: h, fit: 'crop' }
          );
          return `${url} ${resolution}`;
      })
      .join(`,\n`);

      let pickedHeight;

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
        srcSet,
      };
    }
  );
}

const resolveSizes = (image, options, cacheDir) => {
  if (!isImage(image)) return null;

  return getBase64ImageAndBasicMeasurements(image, options, cacheDir).then(
    ({ base64Str, width, height, aspectRatio }) => {

      if (!options.maxWidth) {
        options.maxWidth = options.maxHeight * aspectRatio;
      }

      // If the users didn't set a default sizes, we'll make one.
      if (!options.sizes) {
        options.sizes = `(max-width: ${options.maxWidth}px) 100vw, ${options.maxWidth}px`;
      }

      // Create sizes (in width) for the image. If the max width of the container
      // for the rendered markdown file is 800px, the sizes would then be: 200,
      // 400, 800, 1200, 1600, 2400.
      //
      // This is enough sizes to provide close to the optimal image size for every
      // device size / screen resolution
      let sizes = [];
      sizes.push(options.maxWidth / 4);
      sizes.push(options.maxWidth / 2);
      sizes.push(options.maxWidth);
      sizes.push(options.maxWidth * 1.5);
      sizes.push(options.maxWidth * 2);
      sizes.push(options.maxWidth * 3);
      sizes = sizes.map(Math.round);

      // Filter out sizes larger than the image's maxWidth.
      const filteredSizes = sizes.filter(size => size < image.width)

      // Add the original image to ensure the largest image possible
      // is available for small images.
      filteredSizes.push(width)

      // Create the srcSet.
      const srcSet = filteredSizes
        .map(width => {
          const h = Math.round(width / aspectRatio);
          const url = createUrl(image, options.imgixParams, { fit: 'crop', w: width, h });
          return `${url} ${Math.round(width)}w`;
        })
        .join(`,\n`);

      return {
        base64: base64Str,
        aspectRatio: aspectRatio,
        src: createUrl(image, options.imgixParams, { w: options.maxWidth, h: options.maxWidth / aspectRatio }),
        srcSet,
        sizes: options.sizes,
      };
    }
  );
}

module.exports = function extendAssetNode({ cacheDir }) {

  const fields = {};
  const mappings = {
    boolean: GraphQLBoolean,
    hex_color: GraphQLString,
    integer: GraphQLInt,
    list: GraphQLString,
    number: GraphQLFloat,
    path: GraphQLString,
    string: GraphQLString,
    timestamp: GraphQLString,
    unit_scalar: GraphQLFloat,
    url: GraphQLString,
  }

  objectEntries(imgixParams.parameters).forEach(([param, doc]) => {
    fields[camelize(param)] = {
      type: doc.expects.length === 1 ?
        mappings[doc.expects[0].type] :
        GraphQLString,
      description: `${doc.short_description} (${doc.url})`,
    }
  });

  const ImgixParamsType = new GraphQLInputObjectType({
    name: `DatoCmsImgixParams`,
    fields
  });

  const extension = {
    resolutions: {
      type: new GraphQLObjectType({
        name: `DatoCmsFixed`,
        fields: {
          base64: { type: GraphQLString },
          aspectRatio: { type: GraphQLFloat },
          width: { type: GraphQLFloat },
          height: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
        },
      }),
      args: {
        width: {
          type: GraphQLInt,
          defaultValue: 400,
        },
        height: {
          type: GraphQLInt,
        },
        imgixParams: {
          type: ImgixParamsType,
        },
      },
      resolve(image, options, context) {
        return resolveResolution(image, options, cacheDir);
      },
    },
    sizes: {
      type: new GraphQLObjectType({
        name: `DatoCmsFluid`,
        fields: {
          base64: { type: GraphQLString },
          aspectRatio: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
          sizes: { type: GraphQLString },
        },
      }),
      args: {
        maxWidth: {
          type: GraphQLInt,
          defaultValue: 800,
        },
        maxHeight: {
          type: GraphQLInt,
        },
        sizes: {
          type: GraphQLString,
        },
        imgixParams: {
          type: ImgixParamsType,
        },
      },
      resolve(image, options, context) {
        return resolveSizes(image, options, cacheDir)
      },
    },
    inlineSvg: {
      type: GraphQLString,
      resolve(image, options, context) {
        return resolveInlineSvg(image, options, cacheDir);
      }
    },
  };

  extension.fluid = extension.sizes;
  extension.fixed = extension.resolutions;

  return extension;
}
