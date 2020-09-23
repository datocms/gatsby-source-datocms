import DatoCmsAsset from './DatoCmsAsset';

module.exports = context => {
  [DatoCmsAsset].forEach(fn => fn(context));
};
