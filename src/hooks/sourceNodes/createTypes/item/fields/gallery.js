const { camelizeKeys } = require('humps');

module.exports = () => ({
  type: '[DatoCmsFileField]',
  resolveForSimpleField: (fieldValue, context, node) => {
    if (!fieldValue) {
      return null;
    }

    return fieldValue.map(fileField => {
      const upload = context.nodeModel.getNodeById({
        id: `DatoCmsAsset-${fileField.upload_id}`,
      });

      const uploadDefaultFieldMetadata =
        upload.entityPayload.attributes.default_field_metadata[node.locale];

      return {
        ...upload,
        alt: fileField.alt || uploadDefaultFieldMetadata.alt,
        title: fileField.title || uploadDefaultFieldMetadata.title,
        focalPoint: fileField.focal_point || uploadDefaultFieldMetadata.focal_point,
        customData: {
          ...camelizeKeys(uploadDefaultFieldMetadata.custom_data),
          ...fileField.custom_data,
        },
      };
    });
  },
});
