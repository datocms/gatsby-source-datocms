import DatoCmsFixed from './DatoCmsFixed';
import DatoCmsFluid from './DatoCmsFluid';
import DatoCmsImgixParams from './DatoCmsImgixParams';

module.exports = context => {
  [DatoCmsFixed, DatoCmsFluid, DatoCmsImgixParams].forEach(fn => fn(context));
};
