const buildFluidFields = require('../utils/buildFluidFields');
const buildFixedFields = require('../utils/buildFixedFields');

module.exports = ({ actions, schema, store }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsAsset',
      extensions: { infer: false },
      fields: {
        size: 'Int',
        width: 'Int',
        height: 'Int',
        path: 'String',
        format: 'String',
        isImage: 'Boolean',
        createdAt: {
          type: 'Date',
          extensions: { dateformat: {} },
        },
        url: 'String',
        notes: 'String',
        author: 'String',
        copyright: 'String',
        originalId: 'String',
        ...buildFluidFields(),
        ...buildFixedFields()
      },
      interfaces: ['Node'],
    }),
  ]);
};
