const imgixParams = require('imgix-url-params/dist/parameters');
const { camelize } = require('humps');
const objectEntries = require('object.entries');

module.exports = ({ actions, schema, store }) => {
  const imgixParamsFields = {};

  const mappings = {
    boolean: 'Boolean',
    hex_color: 'String',
    integer: 'Int',
    list: 'String',
    number: 'Float',
    path: 'String',
    string: 'String',
    timestamp: 'String',
    unit_scalar: 'Float',
    font: 'String',
    ratio: 'String',
    url: 'String',
  };

  objectEntries(imgixParams.parameters).forEach(([param, doc]) => {
    let type = 'String';

    if (doc.expects.length === 1) {
      if (mappings[doc.expects[0].type]) {
        type = mappings[doc.expects[0].type];
      }
    }

    imgixParamsFields[camelize(param)] = {
      type,
      description: `${doc.short_description} (${doc.url})`,
    };
  });

  actions.createTypes([
    schema.buildInputObjectType({
      name: `DatoCmsImgixParams`,
      fields: imgixParamsFields,
    }),
  ]);
};
