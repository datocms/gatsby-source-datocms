# gatsby-source-datocms

Source plugin for pulling models and records into Gatsby from DatoCMS administrative areas. It creates links between records so they can be queried in Gatsby using GraphQL.

**IMPORTANT**: If you use this plugin, you will not be able to write queries as described in the [DatoCMS Content Delivery API documentation](https://www.datocms.com/docs/content-delivery-api/). Content will be exposed using [Gatsby's schema-generation](https://www.gatsbyjs.org/docs/schema-generation/). If you want to directly use our GraphQL API in Gatsby, consider using the [gatsby-source-graphql](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-graphql) plugin instead.

## Table of Contents

* [Install](#install)
* [Sample project](#sample-project)
* [How to use](#how-to-use)
* [How to query](#how-to-query)
   * [Accessing records](#accessing-records)
   * [Multiple-paragraph text fields](#multiple-paragraph-text-fields)
   * [Modular content fields](#modular-content-fields)
   * [Favicon meta tags](#favicon-meta-tags)
   * [SEO meta tags](#seo-meta-tags)
   * [Tree-like collections](#tree-like-collections)
   * [Single instance models](#single-instance-models)
   * [Localized fields](#localized-fields)
* [Integration with gatsby-image](#integration-with-gatsby-image)
   * [Responsive fluid](#responsive-fluid)
   * [Responsive fixed](#responsive-fixed)

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
      // You can find your read-only API token under the Settings > API tokens
      // section of your administrative area:
      apiToken: `YOUR_READONLY_API_TOKEN`,

      // If you are working on development/staging environment, you might want to
      // preview the latest version of records instead of the published one:
      previewMode: false,

      // Disable automatic reloading of content when some change occurs on DatoCMS:
      disableLiveReload: false,

      // Custom API base URL (most don't need this)
      // apiUrl: 'https://site-api.datocms.com',

      // Setup locale fallbacks
      // In this example, if some field value is missing in Italian, fall back to English
      localeFallbacks: {
        it: ['en'],
      },
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
  datoCmsBlogPost {
    title
    content {
      ... on DatoCmsText {
        model { apiKey }
        text
      }
      ... on DatoCmsImage {
        model { apiKey }
        image {
          url
        }
      }
    }
  }
}
```

You can then present your blocks in a similar manner:

```jsx
<div>
  {
    data.datoCmsBlogPost.content.map((block) => (
      <div key={block.id}>
        {
          block.model.apiKey === 'text' &&
            <div>{block.text}</div>
        }
        {
          block.model.apiKey === 'image' &&
            <img src={block.image.url} />
        }
      </div>
    ))
  }
</div>
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

This package exposes a `HelmetDatoCms` component and a `GatsbyDatoCmsSeoMetaTags`
GraphQL fragment to make it easier use these information in your website:

PS. [Due to a limitation of GraphiQL](https://github.com/graphql/graphiql/issues/612),
you can not currently use the `GatsbyDatoCmsSeoMetaTags` fragment in the GraphiQL IDE.

```js
import React from 'react'
import Link from 'gatsby-link'
import { HelmetDatoCms } from 'gatsby-source-datocms'

const About = ({ data }) => (
  <article className="sheet">
    <HelmetDatoCms seo={data.datoCmsAboutPage.seoMetaTags} />
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
        ...GatsbyDatoCmsSeoMetaTags
      }
    }
  }
```

If you need to pass additional meta tags to the underlying `Helmet` component, you can add them as children and props to `HelmetDatoCms`:

```js
<HelmetDatoCms seo={data.datoCmsAboutPage.seoMetaTags}>
  <link rel="alternate" href="http://www.mysite.com/it/" hreflang="it" />
  <link rel="alternate" href="http://www.mysite.com/fr/" hreflang="fr" />
</HelmetDatoCms>
```

The `datoCmsSite` global settings has also the `globalSeo` field that contains the fallback fields:

```graphql
{
  datoCmsSite {
    globalSeo {
      siteName
      titleSuffix
      twitterAccount
      facebookPageUrl
      fallbackSeo {
        title
        description
        image {
          url
        }
        twitterCard
      }
    }
  }
}
```

### Favicon meta tags

You can get the complete set of meta tags related to your site favicon this way:

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

Similarly to what happens with SEO meta tags, you can use the `HelmetDatoCms` component with the `GatsbyDatoCmsFaviconMetaTags` fragment to make it easier use these information in your website:

```js
import React from 'react'
import Link from 'gatsby-link'
import { HelmetDatoCms } from 'gatsby-source-datocms'

const TemplateWrapper = ({ data }) => (
  <article className="sheet">
    <HelmetDatoCms favicon={data.datoCmsSite.faviconMetaTags} />
    <h1>{data.datoCmsAboutPage.title}</h1>
    <p>{data.datoCmsAboutPage.subtitle}</p>
  </article>
)

export default TemplateWrapper

export const query = graphql`
  query LayoutQuery {
    datoCmsSite {
      faviconMetaTags {
        ...GatsbyDatoCmsFaviconMetaTags
      }
    }
  }
```

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

If you need to get every locale for a specific field, you can use the `_all<FIELD>Locales` query:

```graphql
{
  allDatoCmsBlogPost(filter: { locale: { eq: "en" } }) {
    edges {
      node {
        _allTitleLocales {
          locale
          value
        }
        _allExcerptLocales {
          locale
          value
        }
      }
    }
  }
}
```

## Integration with `gatsby-image`

Images coming from DatoCMS can be queried so that they can be used with [gatsby-image](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-image), a React component specially designed to work seamlessly with Gatsby's GraphQL queries that implements advanced image loading techniques to easily and completely optimize image loading for your sites.

**NOTE:** [gatsby-plugin-sharp](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-sharp) needs to be listed as a dependancy for the `_tracedSVG` fragments to function.

### Responsive fluid

This GraphQL option allows you to generate responsive images that automatically respond to different device screen resolution and widths. E.g. a smartphone browser will download a much smaller image than a desktop device.

Instead of specifying a width and height, with `fluid` you specify a `maxWidth`, the max width the container of the images reaches.

```jsx
import React from 'react'
import Img from 'gatsby-image'

const About = ({ data }) => (
  <article>
    <Img fluid={data.datoCmsAboutPage.photo.fluid} />
  </article>
)

export default About

export const query = graphql`
  query AboutQuery {
    datoCmsAboutPage {
      photo {
        fluid(maxWidth: 600, imgixParams: { fm: "jpg", auto: "compress" }) {
          ...GatsbyDatoCmsFluid
        }
      }
    }
  }
`
```

The fragments you can use are:

- `GatsbyDatoCmsFluid`: "blur-up" technique to show a preview of the image while it loads;
- `GatsbyDatoCmsFluid_tracedSVG`: "traced placeholder" SVG technique to show a preview of the image while it loads;
- `GatsbyDatoCmsFluid_noBase64`: no preview effects.

`gatsby-image` will automatically use WebP images when the browser supports the file format. If the browser doesn’t support WebP, `gatsby-image` will fall back to the default image format.

### Responsive fixed

If you make queries with resolutions then Gatsby automatically generates images with 1x, 1.5x, 2x, and 3x versions so your images look great on whatever screen resolution of device they're on. If you're on a retina class screen, notice how much sharper these images are.

```jsx
import React from 'react'
import Img from 'gatsby-image'

const About = ({ data }) => (
  <article>
    <Img fixed={data.datoCmsAboutPage.photo.fixed} />
  </article>
)

export default About

export const query = graphql`
  query AboutQuery {
    datoCmsAboutPage {
      photo {
        fixed(width: 200, imgixParams: { fm: "jpg", auto: "compress" }) {
          ...GatsbyDatoCmsFixed
        }
      }
    }
  }
`
```

The fragments you can use are:

- `GatsbyDatoCmsFixed`: "blur-up" technique to show a preview of the image while it loads;
- `GatsbyDatoCmsFixed_tracedSVG`: "traced placeholder" SVG technique to show a preview of the image while it loads;
- `GatsbyDatoCmsFixed_noBase64`: no preview effects.

`gatsby-image` will automatically use WebP images when the browser supports the file format. If the browser doesn’t support WebP, `gatsby-image` will fall back to the default image format.
