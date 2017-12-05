import React from 'react'
import Helmet from 'react-helmet'

export const HelmetDatoCms = ({ record }) => (
  React.createElement(
    Helmet,
    null,
    record.seoMetaTags.tags.map((item, i) =>
      React.createElement(
        item.tagName,
        Object.assign({ key: i }, item.attributes),
        item.content
      )
    )
  )
)
