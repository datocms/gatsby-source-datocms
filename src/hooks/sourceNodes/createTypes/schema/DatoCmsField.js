module.exports = ({ actions, schema }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: 'DatoCmsField',
      extensions: { infer: false },
      fields: {
        label: 'String',
        fieldType: 'String',
        apiKey: 'String',
        localized: 'Boolean',
        validators: 'JSON',
        position: 'Int',
        appeareance: 'JSON',
        defaultValue: 'JSON',
        originalId: 'String',
      },
      interfaces: ['Node'],
    }),
  ]);
};
