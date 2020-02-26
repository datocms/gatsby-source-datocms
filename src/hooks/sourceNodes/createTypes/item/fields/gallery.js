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
      type: '[DatoCmsFileField]',
      allLocalesResolver: (parent) => parent.value___NODE,
      normalResolver: (parent) => parent[`${fieldKey}___NODE`],
      resolveFromValue: (ids, args, context) => {
        if (ids) {
          return context.nodeModel.getNodesByIds({ ids });
        }

        const fileObjects =
          'locale' in parent && 'value' in parent
            ? parent.value
            : parent[fieldKey];

        if (!fileObjects) {
          return null;
        }

        return fileObjects.map(fileObject => {
          const upload = context.nodeModel.getNodeById({ id: fileObject.uploadId___NODE });
          const defaults = upload.defaultFieldMetadata[fileObject.locale];

          return {
            ...upload,
            alt: fileObject.alt || defaults.alt,
            title: fileObject.title || defaults.title,
            customData: { ...defaults.customData, ...fileObject.customData },
          };
        });
      },
    },
  };
};
