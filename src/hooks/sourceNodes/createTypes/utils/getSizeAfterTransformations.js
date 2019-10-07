module.exports = function getSizeAfterTransformations(
  originalWidth,
  originalHeight,
  params = {},
) {
  const originalAspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (params.rect) {
    const [w, h] = params.rect.split(',').slice(2, 4);

    width = Math.min(Math.max(0, parseInt(w)), originalWidth);
    height = Math.min(Math.max(0, parseInt(h)), originalHeight);
  }

  if (
    ['facearea', 'clamp', 'crop', 'fill', 'fillmax', 'scale'].includes(
      params.fit,
    ) &&
    params.w &&
    params.h
  ) {
    width = parseInt(params.w);
    height = parseInt(params.h);

    if (params.fit === 'crop') {
      if (params['max-h']) {
        height = Math.min(height, parseInt(params['max-h']));
      }

      if (params['max-w']) {
        width = Math.min(width, parseInt(params['max-w']));
      }

      if (params['min-h']) {
        height = Math.max(height, parseInt(params['min-h']));
      }

      if (params['min-w']) {
        width = Math.max(width, parseInt(params['min-w']));
      }
    }

    return { width, height };
  }

  if (params.fit === 'min' && (params.w || params.h)) {
    const w = params.w
      ? parseInt(params.w)
      : Math.round(parseInt(params.h) * originalAspectRatio);
    const h = params.h
      ? parseInt(params.h)
      : Math.round(parseInt(params.w) / originalAspectRatio);
    const resize = Math.min(width / w, height / h);
    width = Math.round(width * resize);
    height = Math.round(height * resize);

    return { width, height };
  }

  if (params.w || params.h) {
    const scales = [];

    if (params.w) {
      scales.push(parseInt(params.w) / width);
    }

    if (params.h) {
      scales.push(parseInt(params.h) / height);
    }

    let scale = Math.min(...scales);

    if (params.fit === 'max') {
      scale = Math.max(1, scale);
    }

    width = Math.round(scale * width);
    height = Math.round(scale * height);

    return { width, height };
  }

  return { width, height };
};
