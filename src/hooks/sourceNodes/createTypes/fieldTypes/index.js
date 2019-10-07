import DatoCmsColorField from './DatoCmsColorField';
import DatoCmsFileField from './DatoCmsFileField';
import DatoCmsLatLonField from './DatoCmsLatLonField';
import DatoCmsMetaField from './DatoCmsMetaField';
import DatoCmsSeoField from './DatoCmsSeoField';
import DatoCmsSeoMetaTags from './DatoCmsSeoMetaTags';
import DatoCmsVideoField from './DatoCmsVideoField';

module.exports = (context) => {
  [
    DatoCmsColorField,
    DatoCmsFileField,
    DatoCmsLatLonField,
    DatoCmsMetaField,
    DatoCmsSeoField,
    DatoCmsSeoMetaTags,
    DatoCmsVideoField,
  ].forEach(fn => fn(context));
}
