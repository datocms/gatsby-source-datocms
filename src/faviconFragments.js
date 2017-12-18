export const datoCmsFaviconMetaTags = graphql`
  fragment GatsbyDatoCmsFaviconMetaTags on DatoCmsFaviconMetaTags {
    tags {
      tagName
      attributes {
        rel
        sizes
        href
        name
        content
        type
      }
    }
  }
`

