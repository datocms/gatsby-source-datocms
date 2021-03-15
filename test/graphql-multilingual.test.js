const { suite } = require('uvu');
const { render } = require('datocms-structured-text-to-html-string');
const buildQueryExecutor = require('./support/buildQueryExecutor');
const assertGraphQLResponseEqualToSnapshot = require('./support/assertGraphQLResponseEqualToSnapshot');

const GraphQLMultilingual = suite('GraphQL (Multilingual project)');

let executeQuery;

GraphQLMultilingual.before(async () => {
  executeQuery = await buildQueryExecutor('bb260a9bf12cccf24392dc68209a42');
});

GraphQLMultilingual('focalPoints', async () => {
  const result = await executeQuery(`
    {
      datoCmsArticle(originalId: {eq: "7364344"}) {
        singleAsset {
          focalPoint {
            x
            y
          }
          url

          urlWithFocalPoint: url(imgixParams: { w: "150", h: "40", fit: "crop" })
          fluid(maxWidth: 150, imgixParams: { w: "150", h: "40", fit: "crop" }) { tracedSVG base64 src srcSet }
          blurhashFluid: fluid(maxWidth: 150, forceBlurhash: true, imgixParams: { w: "150", h: "40", fit: "crop" }) { tracedSVG base64 src srcSet }

          tracedSvgFluidGatsbyImage: gatsbyImageData(width: 150, placeholder: TRACED_SVG, layout: CONSTRAINED, imgixParams: { w: "150", h: "40", fit: "crop" })
          dominantSvgFluidGatsbyImage: gatsbyImageData(width: 150, placeholder: DOMINANT_COLOR, layout: CONSTRAINED, imgixParams: { w: "150", h: "40", fit: "crop" })
          blurhashFluidGatsbyImage: gatsbyImageData(width: 150, forceBlurhash: true, placeholder: BLURRED, layout: CONSTRAINED, imgixParams: { w: "150", h: "40", fit: "crop" })
        }
        assetGallery {
          focalPoint {
            x
            y
          }
          url
          urlWithFocalPoint: url(imgixParams: { w: "150", h: "40", fit: "crop" })
          fluid(maxWidth: 150, imgixParams: { w: "150", h: "40", fit: "crop" }) { tracedSVG base64 src srcSet }
          blurhashFluid: fluid(maxWidth: 150, forceBlurhash: true, imgixParams: { w: "150", h: "40", fit: "crop" }) { tracedSVG base64 src srcSet }

          tracedSvgFluidGatsbyImage: gatsbyImageData(width: 150, placeholder: TRACED_SVG, layout: CONSTRAINED, imgixParams: { w: "150", h: "40", fit: "crop" })
          dominantSvgFluidGatsbyImage: gatsbyImageData(width: 150, placeholder: DOMINANT_COLOR, layout: CONSTRAINED, imgixParams: { w: "150", h: "40", fit: "crop" })
          blurhashFluidGatsbyImage: gatsbyImageData(width: 150, forceBlurhash: true, placeholder: BLURRED, layout: CONSTRAINED, imgixParams: { w: "150", h: "40", fit: "crop" })
        }
      }
    }`);

  assertGraphQLResponseEqualToSnapshot('multilingual/focal-point', result);
});

GraphQLMultilingual('auto=format', async () => {
  const result = await executeQuery(`
    {
      datoCmsArticle(originalId: {eq: "7364344"}) {
        singleAsset {
          noFormatUrl: url(imgixParams: { maxW: 200 })
          noFormatFixed: fixed(width: 300, imgixParams: { maxW: 200 }) { src srcSet }
          noFormatFluid: fluid(maxWidth: 140, imgixParams: { w: "140", h: "40", fit: "crop", maxW: 200 }) { src srcSet }

          pngFormatUrl: url(imgixParams: { fm: "png", maxW: 200 })
          pngFormatFixed: fixed(width: 300, imgixParams: { fm: "png", maxW: 200 }) { src srcSet }
          pngFormatFluid: fluid(maxWidth: 140, imgixParams: { w: "140", h: "40", fit: "crop", fm: "png", maxW: 200 }) { src srcSet }
        }
      }

      assetWhichIsNotAnImage: datoCmsAsset(originalId: {eq: "2637251"}) {
        url
        noFormatFluid: fluid(maxWidth: 140) { src srcSet }
      }

      assetWhichIsSvg: datoCmsAsset(originalId: {eq: "10015565"}) {
        url
        noFormatFluid: fluid(maxWidth: 140) { src srcSet }
      }

      assetWhichIsNotAnImageThroughRecord: datoCmsArticle(originalId: {eq: "7364344"}, locale: { eq: "it" }) {
        assetGallery {
          url
          noFormatFluid: fluid(maxWidth: 140) { src srcSet }
        }
      }
    }`);

  assertGraphQLResponseEqualToSnapshot('multilingual/auto-format', result);
});

GraphQLMultilingual('force blurhash', async () => {
  assertGraphQLResponseEqualToSnapshot(
    'multilingual/blurhash',
    await executeQuery(
      `{
          datoCmsAsset(originalId: {eq: "2643791"}) {
            fixed(width: 300) { base64 }
            fluid(maxWidth: 300) { base64 }
            forceBlurhashFixed: fixed(width: 300, forceBlurhash: true) { base64 }
            forceBlurhashFluid: fluid(maxWidth: 300, forceBlurhash: true) { base64 }
          }

          assetWhichIsSvg: datoCmsAsset(originalId: {eq: "10015565"}) {
            fixed(width: 300) { base64 tracedSVG }
            fluid(maxWidth: 300) { base64 tracedSVG }
          }
       }`,
    ),
  );
});

const assetFields = `
    size width height path format isImage notes author copyright tags
    smartTags filename basename exifInfo mimeType blurhash
    originalId url createdAt
    colors { red green blue alpha rgb hex }
    video {
      muxPlaybackId
      frameRate
      duration
      streamingUrl
      gifThumbnailUrl: thumbnailUrl(format: gif)
      jpgThumbnailUrl: thumbnailUrl(format: jpg)
      pngThumbnailUrl: thumbnailUrl(format: png)
      lowMp4Url: mp4Url(exactRes: low)
      mediumMp4Url: mp4Url(exactRes: medium)
      highMp4Url: mp4Url(exactRes: high)
    }
    fixed(width: 300) { base64 aspectRatio width height src srcSet sizes }
    fluid(maxWidth: 300) { base64 aspectRatio width height src srcSet sizes }
    newFixed: gatsbyImageData(width: 300, height: 300, layout: FIXED)
    newFluidW: gatsbyImageData(width: 150, layout: CONSTRAINED)
    newFluidH: gatsbyImageData(height: 150, layout: CONSTRAINED)
    newFluidWH: gatsbyImageData(width: 300, height: 300, layout: CONSTRAINED)
    newFixedSmallerThanOriginal: gatsbyImageData(width: 30, height: 30, layout: FIXED)
    newFluidWSmallerThanOriginal: gatsbyImageData(width: 30, layout: CONSTRAINED)
  `;

const fileFields = `alt title customData ${assetFields}`;

GraphQLMultilingual('assets', async () => {
  assertGraphQLResponseEqualToSnapshot(
    'multilingual/png-asset',
    await executeQuery(
      `{ datoCmsAsset(originalId: {eq: "2637142"}) { ${assetFields} } }`,
    ),
  );
  assertGraphQLResponseEqualToSnapshot(
    'multilingual/mp4-asset',
    await executeQuery(
      `{ datoCmsAsset(originalId: {eq: "2637250"}) { ${assetFields} } }`,
    ),
  );
  assertGraphQLResponseEqualToSnapshot(
    'multilingual/csv-asset',
    await executeQuery(
      `{ datoCmsAsset(originalId: {eq: "2637251"}) { ${assetFields} } }`,
    ),
  );
});

GraphQLMultilingual('sortable collection', async () => {
  assertGraphQLResponseEqualToSnapshot(
    'multilingual/sortable-position',
    await executeQuery(`
    {
      datoCmsSecondaryModel(originalId: {eq: "7364459"}) {
        position
      }
    }
  `),
  );
});

GraphQLMultilingual('site', async () => {
  assertGraphQLResponseEqualToSnapshot(
    'multilingual/site',
    await executeQuery(`
    {
      enSite: datoCmsSite(locale: {eq: "en"}) {
        __typename
        id
        originalId
        name
        locale
        locales
        domain
        internalDomain
        noIndex
        globalSeo {
          siteName
          titleSuffix
          twitterAccount
          facebookPageUrl
          fallbackSeo {
            title
            description
            twitterCard
            image {
              path
              url
            }
          }
        }
        faviconMetaTags {
          tags
        }
      }
      itSite: datoCmsSite(locale: {eq: "it"}) {
        __typename
        id
        originalId
        name
        locale
        locales
        domain
        internalDomain
        noIndex
        globalSeo {
          siteName
          titleSuffix
          twitterAccount
          facebookPageUrl
          fallbackSeo {
            title
            description
            twitterCard
            image {
              path
              url
            }
          }
        }
        faviconMetaTags {
          tags
        }
      }
    }
  `),
  );
});

GraphQLMultilingual('tree collections', async () => {
  assertGraphQLResponseEqualToSnapshot(
    'multilingual/tree',
    await executeQuery(`
      {
        allDatoCmsHierarchical(filter: {root: {eq: true}, locale: {eq: "en"}}) {
          nodes {
            id
            title
            position
            treeChildren {
              id
              title
              position
              treeParent {
                id
                title
              }
              treeChildren {
                id
                title
                position
                treeChildren {
                  id
                  title
                  position
                }
              }
            }
          }
        }
      }
    `),
  );
});

GraphQLMultilingual('items', async () => {
  const query = `
    {
      enArticle: datoCmsArticle(originalId: {eq: "7364344"}, locale: {eq: "en"}) {
        __typename
        locale
        originalId
        id
        singleLineString
        _allSingleLineStringLocales {
          locale
          value
        }
        multipleParagraphText
        _allMultipleParagraphTextLocales {
          locale
          value
        }
        multipleParagraphTextNode {
          id
          internal {
            content
          }
          childMarkdownRemark {
            html
            timeToRead
          }
        }
        singleAsset {
          ${fileFields}
        }
        _allSingleAssetLocales {
          locale
          value {
            ${fileFields}
          }
        }
        assetGallery {
          ${fileFields}
        }
        _allAssetGalleryLocales {
          locale
          value {
            ${fileFields}
          }
        }
        externalVideo {
          __typename
          url
          title
          provider
          providerUid
          thumbnailUrl
          width
          height
        }
        _allExternalVideoLocales {
          locale
          value {
            __typename
            url
            title
            provider
            providerUid
            thumbnailUrl
            width
            height
          }
        }
        date(formatString: "YYYY MMMM DD")
        _allDateLocales {
          locale
          value
        }
        dateTime(formatString: "YYYY MMMM DD @ HH:mm")
        _allDateTimeLocales {
          locale
          value
        }
        integerNumber
        _allIntegerNumberLocales {
          locale
          value
        }
        floatingPointNumber
        _allFloatingPointNumberLocales {
          locale
          value
        }
        boolean
        _allBooleanLocales {
          locale
          value
        }
        location {
          latitude
          longitude
        }
        _allLocationLocales {
          locale
          value {
            __typename
            latitude
            longitude
          }
        }
        color {
          red
          green
          blue
          alpha
          rgb
          hex
        }
        _allColorLocales {
          locale
          value {
            red
            green
            blue
            alpha
            rgb
            hex
          }
        }
        slug
        _allSlugLocales {
          locale
          value
        }
        seo {
          title
          description
          twitterCard
          image {
            path
          }
        }
        _allSeoLocales {
          locale
          value {
            title
            description
            twitterCard
            image {
              path
            }
          }
        }
        singleLink {
          id
          singleLineString
        }
        _allSingleLinkLocales {
          locale
          value {
            id
            singleLineString
          }
        }
        advancedSingleLink {
          __typename
          ... on DatoCmsArticle {
            singleLineString
          }
          ... on DatoCmsSecondaryModel {
            title
          }
        }
        _allAdvancedSingleLinkLocales {
          locale
          value {
            __typename
            ... on DatoCmsArticle {
              singleLineString
            }
            ... on DatoCmsSecondaryModel {
              title
            }
          }
        }
        multipleLinks {
          id
          singleLineString
        }
        _allMultipleLinksLocales {
          locale
          value {
            id
            singleLineString
          }
        }
        advancedMultipleLinks {
          __typename
          ... on DatoCmsArticle {
            singleLineString
          }
          ... on DatoCmsSecondaryModel {
            title
          }
        }
        _allAdvancedMultipleLinksLocales {
          locale
          value {
            __typename
            ... on DatoCmsArticle {
              singleLineString
            }
            ... on DatoCmsSecondaryModel {
              title
            }
          }
        }
        json
        _allJsonLocales {
          locale
          value
        }
        modularContent {
          title
          originalId
        }
        _allModularContentLocales {
          locale
          value {
            title
            originalId
          }
        }
        structuredText {
          value
          blocks {
            __typename
            ... on DatoCmsModularBlock {
              id: originalId
              title
            }
          }
          links {
            __typename
            ... on DatoCmsArticle {
              id: originalId
              singleLineString
              slug
            }
          }
        }
        _allStructuredTextLocales {
          locale
          value {
            value
            blocks {
              __typename
              ... on DatoCmsModularBlock {
                id: originalId
                title
              }
            }
            links {
              __typename
              ... on DatoCmsArticle {
                id: originalId
                singleLineString
                slug
              }
            }
          }
        }
        meta {
          createdAt
          updatedAt
          status
          isValid
          publishedAt
          __typename
        }
        seoMetaTags {
          __typename
          tags
          id
        }
        model {
          id
          name
          singleton
          sortable
          apiKey
          orderingDirection
          tree
          modularBlock
          draftModeActive
          allLocalesRequired
          collectionAppeareance
          hasSingletonItem
          originalId
        }
      }
      datoCmsOptionalLocalesModel(originalId: {eq: "14830204"}, locale: {eq: "it"}) {
        title
        boolean
      }
    }
  `;

  const result = await executeQuery(query);

  assertGraphQLResponseEqualToSnapshot('multilingual/item', result);

  const output = render(result.data.enArticle.structuredText, {
    renderInlineRecord: ({ adapter, record }) => {
      switch (record.__typename) {
        case 'DatoCmsArticle':
          return adapter.renderNode(
            'a',
            { href: `/docs/${record.slug}` },
            record.singleLineString,
          );
        default:
          return null;
      }
    },
    renderLinkToRecord: ({ record, children, adapter }) => {
      switch (record.__typename) {
        case 'DatoCmsArticle':
          return adapter.renderNode(
            'a',
            { href: `/docs/${record.slug}` },
            children,
          );
        default:
          return null;
      }
    },
    renderBlock: ({ record, adapter }) => {
      switch (record.__typename) {
        case 'DatoCmsModularBlock':
          return adapter.renderNode('figure', null, record.title);
        default:
          return null;
      }
    },
  });

  assertGraphQLResponseEqualToSnapshot(
    'multilingual/structuredTextRender',
    output,
  );
});

GraphQLMultilingual('multiple instances', async () => {
  assertGraphQLResponseEqualToSnapshot(
    'multipleInstances',
    await executeQuery(
      `{
          datoCmsAlternativeSite(locale: {eq: "en"}) {
            __typename
            id
            originalId
            name
            locale
            locales
            domain
            internalDomain
            noIndex
            globalSeo {
              siteName
              titleSuffix
              twitterAccount
              facebookPageUrl
              fallbackSeo {
                title
                description
                twitterCard
                image {
                  path
                  url
                }
              }
            }
            faviconMetaTags {
              tags
            }
          }
          allDatoCmsAlternativeModel {
            nodes {
              name
            }
          }
          allDatoCmsAlternativeAsset {
            nodes {
              url
            }
          }
          allDatoCmsAlternativeArticle {
            nodes {
              __typename
              locale
              originalId
              id
              name
              seoMetaTags {
                __typename
                tags
                id
              }
            }
          }
       }`,
    ),
  );
});

GraphQLMultilingual.run();
