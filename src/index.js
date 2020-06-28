const React = require('react');
const { Helmet } = require('react-helmet');
const objectEntries = require('object.entries');
const objectAssign = require('object-assign');

const globalTagsSwitch = (item) => {
	switch (item[0]) {
		case 'siteName':
			return 'title'
		case 'twitterAccount':
			return 'twitter:site'
		case 'facebookPageUrl':
			return 'og:facebook'
		default:
			return 'description'
	}
}

const HelmetDatoCms = ({ seo, globalSeo, favicon, children, ...rest }) => {
  return React.createElement(
    Helmet,
    rest,
    (seo ? seo.tags : [])
      .concat(favicon ? favicon.tags : [])
      .map((item, i) =>
        React.createElement(
          item.tagName,
          objectAssign(
            { key: `helmet-datocms-${i}` },
            objectEntries(item.attributes || {}).reduce(
              (acc, [name, value]) => {
                if (value) {
                  acc[name] = value;
                }
                return acc;
              },
              {},
            ),
          ),
          item.content,
        ),
      )
      .concat(children),
    (globalSeo ? objectEntries(globalSeo) : [])
			.map((item, i) => {
				React.createElement(
					'meta',
					globalTagsSwitch(item[0]),
					item[1] ? item[1] : ''
				)
			})
			.concat(children)
  );
};

module.exports = { HelmetDatoCms };
