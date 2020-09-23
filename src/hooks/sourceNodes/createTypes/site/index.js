import DatoCmsSite from './DatoCmsSite';
import DatoCmsFaviconMetaTags from './DatoCmsFaviconMetaTags';
import DatoCmsGlobalSeo from './DatoCmsGlobalSeo';

module.exports = context => {
  [DatoCmsSite, DatoCmsFaviconMetaTags, DatoCmsGlobalSeo].forEach(fn =>
    fn(context),
  );
};
