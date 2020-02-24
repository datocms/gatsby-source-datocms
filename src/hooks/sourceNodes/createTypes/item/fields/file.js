const { camelize } = require('humps');

module.exports = ({
  parentItemType,
  field,
  schema,
  gqlItemTypeName,
  entitiesRepo,
}) => {
  const fieldKey = camelize(field.apiKey);

  return {
    fieldType: {
      type: 'DatoCmsFileField',
      allLocalesResolver: (parent) => parent.value,
      normalResolver: (parent) => parent[fieldKey],
      resolveFromValue: (fileObject, args, context) => {
        if (!fileObject) {
          return null;
        }

        const upload = context.nodeModel.getNodeById({ id: fileObject.uploadId___NODE });
        const defaults = upload.defaultFieldMetadata[fileObject.locale];

        return {
          ...upload,
          alt: fileObject.alt || defaults.alt,
          title: fileObject.title || defaults.title,
          customData: { ...defaults.customData, ...fileObject.customData },
        };
      },
    },
  };
};