const buildFluidFields = require('../utils/buildFluidFields');
const buildFixedFields = require('../utils/buildFixedFields');

module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsFileField',
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
        alt: 'String',
        title: 'String',
        customData: 'JSON',
        ...buildFluidFields(),
        ...buildFixedFields()
      },
    }),
  ]);
}

