import DatoCmsField from './DatoCmsField';
import DatoCmsModel from './DatoCmsModel';

module.exports = context => {
  [DatoCmsField, DatoCmsModel].forEach(fn => fn(context));
};
