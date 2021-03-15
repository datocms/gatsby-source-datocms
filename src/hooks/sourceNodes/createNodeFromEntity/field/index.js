const buildNode = require('../utils/buildNode');

const attributes = [
  'label',
  'fieldType',
  'apiKey',
  'localized',
  'validators',
  'position',
  'appeareance',
  'defaultValue',
];

module.exports = function buildFieldNode(entity, { generateType }) {
  return buildNode(generateType('Field'), entity.id, node => {
    attributes.forEach(attribute => {
      node[attribute] = entity[attribute];
    });

    node.originalId = entity.id;
  });
};
