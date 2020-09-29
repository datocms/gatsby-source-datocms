const { camelize, camelizeKeys } = require('datocms-client');

module.exports = () => ({
  type: 'DatoCmsFileField',
  resolveForSimpleField: (fieldValue, context, node) => {
    if (!fieldValue) {
      return null;
    }

    const upload = context.nodeModel.getNodeById({
      id: `DatoCmsAsset-${fieldValue.upload_id}`,
    });

    const uploadDefaultFieldMetadata =
      upload.entityPayload.attributes.default_field_metadata[node.locale];

    return {
      ...upload,
      alt: fieldValue.alt || uploadDefaultFieldMetadata.alt,
      title: fieldValue.title || uploadDefaultFieldMetadata.title,
      focalPoint: fieldValue.focal_point || uploadDefaultFieldMetadata.focal_point,
      customData: {
        ...camelizeKeys(uploadDefaultFieldMetadata.custom_data),
        ...fieldValue.custom_data,
      },
    };
  },
});
