const { camelizeKeys } = require('datocms-client');

function localizedDefaultFieldMetadata(metadata, attribute, i18n) {
  const fallbacks = i18n.fallbacks || {};
  const locales = [i18n.locale].concat(fallbacks[i18n.locale] || []);
  const localeWithValue = locales.find(locale => {
    const localeValue = metadata[locale][attribute];
    return (
      localeValue && localeValue !== null && localeValue !== undefined && localeValue !== ''
    );
  });
  return localeWithValue ? metadata[localeWithValue][attribute] : null;
}

module.exports = () => ({
  type: 'DatoCmsFileField',
  resolveForSimpleField: (fieldValue, context, node, i18n) => {
    if (!fieldValue) {
      return null;
    }

    const upload = context.nodeModel.getNodeById({
      id: `DatoCmsAsset-${fieldValue.upload_id}`,
    });

    const defaultAlt = localizedDefaultFieldMetadata(upload.entityPayload.attributes.default_field_metadata, 'alt', i18n);
    const defaultTitle = localizedDefaultFieldMetadata(upload.entityPayload.attributes.default_field_metadata, 'title', i18n);
    const defaultFocalPoint = localizedDefaultFieldMetadata(upload.entityPayload.attributes.default_field_metadata, 'focal_point', i18n);
    const defaultCustomData = localizedDefaultFieldMetadata(upload.entityPayload.attributes.default_field_metadata, 'custom_data', i18n);

    return {
      ...upload,
      alt: fieldValue.alt || defaultAlt,
      title: fieldValue.title || defaultTitle,
      focalPoint: fieldValue.focal_point || defaultFocalPoint,
      customData: {
        ...camelizeKeys(defaultCustomData),
        ...fieldValue.custom_data,
      },
    };
  },
});
