const React = require('react');
const { Helmet } = require('react-helmet');
const objectEntries = require('object.entries');
const objectAssign = require('object-assign');

const HelmetDatoCms = ({ seo, favicon, children, ...rest }) => {
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
  );
};

module.exports = { HelmetDatoCms };
