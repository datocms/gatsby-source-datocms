const { render } = require('datocms-structured-text-to-html-string');
const buildQueryExecutor = require('./support/buildQueryExecutor');

jest.setTimeout(60000);

let executeQuery;

beforeAll(async () => {
  try {
    [executeQuery] = await buildQueryExecutor('bb260a9bf12cccf24392dc68209a42');
  } catch (e) {
    console.log('ERROR', e);
    throw e;
  }
});

test('focalPoints', async () => {
  const result = await executeQuery(/* GraphQL */ `
    {
      datoCmsArticle(originalId: { eq: "7364344" }) {
        singleAsset {
          focalPoint {
            x
            y
          }
          url
          urlWithFocalPoint: url(
            imgixParams: { w: "150", h: "40", fit: "crop" }
          )
          fluid(
            maxWidth: 150
            imgixParams: { w: "150", h: "40", fit: "crop" }
          ) {
            base64
            src
            srcSet
          }
          blurhashFluid: fluid(
            maxWidth: 150
            forceBlurhash: true
            imgixParams: { w: "150", h: "40", fit: "crop" }
          ) {
            base64
            src
            srcSet
          }
          dominantSvgFluidGatsbyImage: gatsbyImageData(
            width: 150
            placeholder: DOMINANT_COLOR
            layout: CONSTRAINED
            imgixParams: { w: "150", h: "40", fit: "crop" }
          )
          blurhashFluidGatsbyImage: gatsbyImageData(
            width: 150
            forceBlurhash: true
            placeholder: BLURRED
            layout: CONSTRAINED
            imgixParams: { w: "150", h: "40", fit: "crop" }
          )
        }
        assetGallery {
          focalPoint {
            x
            y
          }
          url
          urlWithFocalPoint: url(
            imgixParams: { w: "150", h: "40", fit: "crop" }
          )
          fluid(
            maxWidth: 150
            imgixParams: { w: "150", h: "40", fit: "crop" }
          ) {
            base64
            src
            srcSet
          }
          blurhashFluid: fluid(
            maxWidth: 150
            forceBlurhash: true
            imgixParams: { w: "150", h: "40", fit: "crop" }
          ) {
            base64
            src
            srcSet
          }
          dominantSvgFluidGatsbyImage: gatsbyImageData(
            width: 150
            placeholder: DOMINANT_COLOR
            layout: CONSTRAINED
            imgixParams: { w: "150", h: "40", fit: "crop" }
          )
          blurhashFluidGatsbyImage: gatsbyImageData(
            width: 150
            forceBlurhash: true
            placeholder: BLURRED
            layout: CONSTRAINED
            imgixParams: { w: "150", h: "40", fit: "crop" }
          )
        }
      }
      noFocalPoint: datoCmsArticle(originalId: { eq: "7364346" }) {
        singleAsset {
          focalPoint {
            x
            y
          }
        }
      }
    }
  `);

  expect(result).toMatchSnapshot();
});

// https://github.com/gatsbyjs/gatsby/discussions/37104
test('tracedSVG', async () => {
  const result = await executeQuery(/* GraphQL */ `
    {
      datoCmsArticle(originalId: { eq: "7364344" }) {
        singleAsset {
          fluid(
            maxWidth: 150
            imgixParams: { w: "150", h: "40", fit: "crop" }
          ) {
            tracedSVG
          }
          blurhashFluid: fluid(
            maxWidth: 150
            forceBlurhash: true
            imgixParams: { w: "150", h: "40", fit: "crop" }
          ) {
            tracedSVG
          }
          tracedSvgFluidGatsbyImage: gatsbyImageData(
            width: 150
            placeholder: TRACED_SVG
            layout: CONSTRAINED
            imgixParams: { w: "150", h: "40", fit: "crop" }
          )
        }
        assetGallery {
          fluid(
            maxWidth: 150
            imgixParams: { w: "150", h: "40", fit: "crop" }
          ) {
            tracedSVG
          }
          blurhashFluid: fluid(
            maxWidth: 150
            forceBlurhash: true
            imgixParams: { w: "150", h: "40", fit: "crop" }
          ) {
            tracedSVG
          }
          tracedSvgFluidGatsbyImage: gatsbyImageData(
            width: 150
            placeholder: TRACED_SVG
            layout: CONSTRAINED
            imgixParams: { w: "150", h: "40", fit: "crop" }
          )
        }
      }
      assetWhichIsSvg: datoCmsAsset(originalId: { eq: "10015565" }) {
        fixed(width: 300) {
          tracedSVG
        }
        fluid(maxWidth: 300) {
          tracedSVG
        }
      }
    }
  `);

  expect(result).toMatchSnapshot();
});

test('auto=format', async () => {
  const result = await executeQuery(/* GraphQL */ `
    {
      datoCmsArticle(originalId: { eq: "7364344" }) {
        singleAsset {
          noFormatUrl: url(imgixParams: { maxW: 200 })
          noFormatFixed: fixed(width: 300, imgixParams: { maxW: 200 }) {
            src
            srcSet
          }
          noFormatFluid: fluid(
            maxWidth: 140
            imgixParams: { w: "140", h: "40", fit: "crop", maxW: 200 }
          ) {
            src
            srcSet
          }

          pngFormatUrl: url(imgixParams: { fm: "png", maxW: 200 })
          pngFormatFixed: fixed(
            width: 300
            imgixParams: { fm: "png", maxW: 200 }
          ) {
            src
            srcSet
          }
          pngFormatFluid: fluid(
            maxWidth: 140
            imgixParams: {
              w: "140"
              h: "40"
              fit: "crop"
              fm: "png"
              maxW: 200
            }
          ) {
            src
            srcSet
          }
        }
      }

      assetWhichIsNotAnImage: datoCmsAsset(originalId: { eq: "2637251" }) {
        url
        noFormatFluid: fluid(maxWidth: 140) {
          src
          srcSet
        }
      }

      assetWhichIsSvg: datoCmsAsset(originalId: { eq: "10015565" }) {
        url
        noFormatFluid: fluid(maxWidth: 140) {
          src
          srcSet
        }
      }

      assetWhichIsNotAnImageThroughRecord: datoCmsArticle(
        originalId: { eq: "7364344" }
        locale: "it"
      ) {
        assetGallery {
          url
          noFormatFluid: fluid(maxWidth: 140) {
            src
            srcSet
          }
        }
      }
    }
  `);

  expect(result).toMatchSnapshot();
});

test('force blurhash', async () => {
  const result = await executeQuery(/* GraphQL */ `
    {
      datoCmsAsset(originalId: { eq: "2643791" }) {
        fixed(width: 300) {
          base64
        }
        fluid(maxWidth: 300) {
          base64
        }
        forceBlurhashFixed: fixed(width: 300, forceBlurhash: true) {
          base64
        }
        forceBlurhashFluid: fluid(maxWidth: 300, forceBlurhash: true) {
          base64
        }
      }

      assetWhichIsSvg: datoCmsAsset(originalId: { eq: "10015565" }) {
        fixed(width: 300) {
          base64
        }
        fluid(maxWidth: 300) {
          base64
        }
      }
    }
  `);
  expect(result).toMatchSnapshot();
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

test('assets', async () => {
  expect(
    await executeQuery(/* GraphQL */ `{
        one: datoCmsAsset(originalId: {eq: "2637142"}) { ${assetFields} }
        two: datoCmsAsset(originalId: {eq: "2637250"}) { ${assetFields} }
        three: datoCmsAsset(originalId: {eq: "2637251"}) { ${assetFields} }
      }`),
  ).toMatchSnapshot();
});

test('sortable collection', async () => {
  expect(
    await executeQuery(/* GraphQL */ `
      {
        datoCmsSecondaryModel(originalId: { eq: "7364459" }) {
          position
        }
      }
    `),
  ).toMatchSnapshot();
});

test('site', async () => {
  expect(
    await executeQuery(/* GraphQL */ `
      {
        enSite: datoCmsSite(locale: "en") {
          __typename
          id
          originalId
          name
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
        itSite: datoCmsSite(locale: "it") {
          __typename
          id
          originalId
          name
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
  ).toMatchSnapshot();
});

test('tree collections', async () => {
  expect(
    await executeQuery(/* GraphQL */ `
      {
        allDatoCmsHierarchical(filter: { root: { eq: true } }) {
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
  ).toMatchSnapshot();
});

test('items', async () => {
  const query = /* GraphQL */ `
    {
      enArticle: datoCmsArticle(originalId: {eq: "7364344"}, locale: "en") {
        __typename
        originalId
        id
        locales
        singleLineString
        _allSingleLineStringLocales {
          locale
          value
        }
        multipleParagraphText
        itMultipleParagraphText: multipleParagraphText(locale: "it")
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
        itMultipleParagraphTextNode: multipleParagraphTextNode(locale: "it") {
          id
          childMarkdownRemark {
            html
          }
        }
        itViaFallbackMultipleParagraphTextNode: multipleParagraphTextNode(locale: "jp", fallbackLocales: ["it"]) {
          id
          childMarkdownRemark {
            html
          }
        }
        _allMultipleParagraphTextLocales {
          locale
          value
          valueNode {
            id
            internal {
              content
            }
            childMarkdownRemark {
              html
              timeToRead
            }
          }
        }
        unlocalizedMultipleParagraphText
        unlocalizedMultipleParagraphTextNode {
          id
          internal {
            content
          }
          childMarkdownRemark {
            html
            headings {
              id
              value
              depth
            }
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
            singleLineString(fallbackLocales: ["en"])
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
          singleLink {
            singleLineString
          }
          multipleLinks {
            singleLineString
          }
          innerModularContent {
            title
            originalId
            singleLink {
              singleLineString
            }
            multipleLinks {
              singleLineString
            }
          }
        }
        _allModularContentLocales {
          locale
          value {
            title
            originalId
            singleLink {
              singleLineString
            }
            multipleLinks {
              singleLineString
            }
            innerModularContent {
              title
              originalId
              singleLink {
                singleLineString
              }
              multipleLinks {
                singleLineString
              }
            }
          }
        }
        structuredText {
          value
          blocks {
            __typename
            ... on DatoCmsModularBlock {
              id: originalId
              title
              singleLink {
                singleLineString
              }
              multipleLinks {
                singleLineString
              }
              innerModularContent {
                title
                originalId
                singleLink {
                  singleLineString
                }
                multipleLinks {
                  singleLineString
                }
              }
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
                singleLink {
                  singleLineString
                }
                multipleLinks {
                  singleLineString
                }
                innerModularContent {
                  title
                  originalId
                  singleLink {
                    singleLineString
                  }
                  multipleLinks {
                    singleLineString
                  }
                }
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
      allDatoCmsOptionalLocalesModel(locale: "it", fallbackLocales: ["en"]) {
        nodes {
          originalId
          title
          boolean
        }
      }
    }
  `;

  const result = await executeQuery(query);

  expect(result).toMatchSnapshot();
});

test('_allXXXLocales with fallback', async () => {
  const query = /* GraphQL */ `
    {
      noFallback: allDatoCmsOptionalLocalesModel {
        nodes {
          _allTitleLocales {
            locale
            value
          }
        }
      }
      fallbackToplevel: allDatoCmsOptionalLocalesModel(
        fallbackLocales: ["en"]
      ) {
        nodes {
          _allTitleLocales {
            locale
            value
          }
        }
      }
      fallbackAllLocales: allDatoCmsOptionalLocalesModel {
        nodes {
          _allTitleLocales(fallbackLocales: ["en"]) {
            locale
            value
          }
        }
      }
    }
  `;

  const result = await executeQuery(query);

  expect(result).toMatchSnapshot();
});

test('items (parallel)', async () => {
  const getQuery = locale => /* GraphQL */ `
    {
      article: datoCmsArticle(originalId: {eq: "7364344"}, locale: "${locale}") {
        __typename
        originalId
        id
        locales
        singleLineString
        singleLink {
          id
          singleLineString
        }
        multipleLinks {
          id
          singleLineString
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
      }
      allDatoCmsOptionalLocalesModel(locale: "it", fallbackLocales: ["en"]) {
        nodes {
          originalId
          title
          boolean
        }
      }
    }
  `;

  const [result1, result2] = await Promise.all([
    executeQuery(getQuery(`en`)),
    executeQuery(getQuery(`it`)),
  ]);

  // we compare results of queries running in parallel to results of queries running one by one
  expect(await executeQuery(getQuery(`en`))).toEqual(result1);
  expect(await executeQuery(getQuery(`it`))).toEqual(result2);
});

test('structured text', async () => {
  const query = /* GraphQL */ `
    {
      enArticle: datoCmsArticle(originalId: { eq: "7364344" }, locale: "en") {
        structuredText {
          value
          blocks {
            __typename
            ... on DatoCmsModularBlock {
              id: originalId
              title
              singleLink {
                singleLineString
              }
              multipleLinks {
                singleLineString
              }
              innerModularContent {
                title
                originalId
                singleLink {
                  singleLineString
                }
                multipleLinks {
                  singleLineString
                }
              }
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
    }
  `;

  const result = await executeQuery(query);

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

  expect(output).toMatchSnapshot();
});

test('multiple instances', async () => {
  const result = await executeQuery(
    /* GraphQL */
    `
      {
        datoCmsAlternativeSite(locale: "en") {
          __typename
          id
          originalId
          name
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
            originalId
            id
            name
            seo {
              image {
                path
              }
            }
            seoMetaTags {
              __typename
              tags
            }
          }
        }
      }
    `,
  );
  expect(result).toMatchSnapshot();
});
