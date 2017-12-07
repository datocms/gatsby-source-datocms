# gatsby-source-datocms

Source plugin for pulling models and records into Gatsby from DatoCMS administrative areas. It creates links between records so they can be queried in Gatsby using GraphQL.

## Install

`npm install --save gatsby-source-datocms`

## Sample project

We've prepared a [sample Gatsby project](https://github.com/datocms/gatsby-portfolio) for you!

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-datocms`,
    options: {
      apiToken: `YOUR_READONLY_API_TOKEN`,
    },
  },
]
```

## How to query

Two standard data types will be available from DatoCMS: `DatoCmsModel` and `DatoCmsSite`. You can query model nodes created from DatoCMS like the following:

```graphql
{
  allDatoCmsModel {
    edges {
      node {
        apiKey
        name
        fields {
          apiKey
          fieldType
        }
      }
    }
  }
}
```

Your site global settings can be queried like this:

```graphql
{
  datoCmsSite {
    name
    internalDomain
    locales
  }
}
```

### Accessing records

Non-standard data types, i.e. models you define in DatoCMS, will also be
available in Gatsby. They'll be created in your site's GraphQL schema under
`datoCms{modelApiKey}` and `allDatoCms{modelApiKey}`. For example,
if you have a `blog_post` model, you will be able to query it like the following:

```graphql
{
  allDatoCmsBlogPost(sort: { fields: [publicationDate], order: DESC }, limit: 5) {
    edges {
      node {
        title
        excerpt
        publicationDate(formatString: "MM-DD-YYYY")
        author {
          name
          avatar {
            url
          }
        }
      }
    }
  }
}
```

### Multiple-paragraph text fields

Fields of type *Multiple-paragraph text* will be available both as simple
strings (ie. `excerpt`) and nodes (ie. `excerptNode`). You can use the latter 
if you want to apply further transformations, like converting markdown with [`gatsby-transformer-remark`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark)):

```graphql
{
  allDatoCmsBlogPost {
    edges {
      node {
        excerptNode {
          childMarkdownRemark {
            html
            timeToRead
          }
        }
      }
    }
  }
}
```

### Modular content fields

[Modular-content fields](https://docs.datocms.com/schema/modular-content.html) can be queried this way:

```graphql
{
  allDatoCmsBlogPost {
    edges {
      node {
        title
        content {
          ... on DatoCmsText {
            text
          }
          ... on DatoCmsImage {
            image {
              url
            }
          }
        }
      }
    }
  }
}
```

### Favicon

You can get the complete set of meta tags related to your site favicon like this:

```graphql
{
  datoCmsSite {
    faviconMetaTags {
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
}
```

### SEO meta tags

All records have a `seoMetaTags` field that you can use to build SEO meta tags
for your record's pages:

```graphql
{
  allDatoCmsBlogPost {
    edges {
      node {
        title
        seoMetaTags {
          tags {
            tagName
            content
            attributes {
              property
              content
              name
            }
          }
        }
      }
    }
  }
}
```

This package exposes a `HelmetDatoCms` component and a `datoCmsSeoMetaTagsFields` 
GraphQL fragment to make it easier use these information in your website:

```js
import React from 'react'
import Link from 'gatsby-link'
import { HelmetDatoCms } from 'gatsby-source-datocms'

const About = ({ data }) => (
  <article className="sheet">
    <HelmetDatoCms record={data.datoCmsAboutPage} />
    <h1>{data.datoCmsAboutPage.title}</h1>
    <p>{data.datoCmsAboutPage.subtitle}</p>
  </article>
)

export default About;

export const query = graphql`
  query AboutQuery {
    datoCmsAboutPage {
      title
      subtitle
      seoMetaTags {
        ...datoCmsSeoMetaTagsFields
      }
    }
  }
```

PS. The `datoCmsSeoMetaTagsFields` fragment won't be available in GraphiQL, only
in your component query!


### Tree-like collections

If you have a model configured as a tree, you can navigate the hierarchy with
`treeChildren` and `treeParent` this way:

```graphql
{
  allDatoCmsCategory(filter: { root: { eq: true } }) {
    edges {
      node {
        title
        treeChildren {
          title
          treeChildren {
            title
          }
        }
      }
    }
  }
}
```

### Single instance models

You can access to single instance models like this:

```graphql
{
  datoCmsHomepage {
    title
    content
  }
}
```

### Localized fields

If your site is multi-lingual, records will be duplicated for every locale 
available, so you can query them like this. The same applies for the `DatoCmsSite`
node:


```graphql
{
  allDatoCmsBlogPost(filter: { locale: { eq: "it" } }) {
    edges {
      node {
        title
        excerpt
      }
    }
  }

  datoCmsHomepage(locale: { eq: "it" }) {
    title
    content
  }
}
```

### Integration with `gatsby-image`

Images coming from DatoCMS can be queried so that they can be used with [gatsby-image](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-image), a React component specially designed to work seamlessly with Gatsby's GraphQL queries that implements advanced image loading techniques to easily and completely optimize image loading for your sites.

#### Responsive Sizes

This GraphQL option allows you to generate responsive images that automatically respond to different device screen resolution and widths. E.g. a smartphone browser will download a much smaller image than a desktop device.

Instead of specifying a width and height, with sizes you specify a `maxWidth`, the max width the container of the images reaches.

```jsx
import React from 'react'
import Img from 'gatsby-image'

const About = ({ data }) => (
  <article>
    <Img sizes={data.datoCmsAboutPage.photo.sizes} />
  </article>
)

export default About

export const query = graphql`
  query AboutQuery {
    datoCmsAboutPage {
      photo {
        sizes(maxWidth: 600, imgixParams: { fm: "jpg", auto: "compress" }) {
          ...GatsbyDatoCmsSizes
        }
      }
    }
  }
`
```

#### Responsive Resolution

If you make queries with resolutions then Gatsby automatically generates images with 1x, 1.5x, 2x, and 3x versions so your images look great on whatever screen resolution of device they're on. If you're on a retina class screen, notice how much sharper these images are than the above "resized" images.

```jsx
import React from 'react'
import Img from 'gatsby-image'

const About = ({ data }) => (
  <article>
    <Img resolutions={data.datoCmsAboutPage.photo.resolutions} />
  </article>
)

export default About

export const query = graphql`
  query AboutQuery {
    datoCmsAboutPage {
      photo {
        resolutions(width: 200, imgixParams: { fm: "jpg", auto: "compress" }) {
          ...GatsbyDatoCmsResolutions
        }
      }
    }
  }
`
```

