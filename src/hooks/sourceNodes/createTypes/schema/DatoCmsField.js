module.exports = ({ actions, schema, generateType }) => {
  actions.createTypes([
    schema.buildObjectType({
      name: generateType('Field'),
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
