import { graphql } from 'gatsby';

export const datoCmsFaviconMetaTags = graphql`
  fragment GatsbyDatoCmsFaviconMetaTags on DatoCmsFaviconMetaTags {
    tags
  }
`

