export const datoCmsAssetResolutions = graphql`
  fragment GatsbyDatoCmsResolutions on DatoCmsResolutions {
    base64
    width
    height
    src
    srcSet
  }
`

export const datoCmsAssetResolutionsNoBase64 = graphql`
  fragment GatsbyDatoCmsResolutions_noBase64 on DatoCmsResolutions {
    width
    height
    src
    srcSet
  }
`

export const datoCmsAssetSizes = graphql`
  fragment GatsbyDatoCmsSizes on DatoCmsSizes {
    base64
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const datoCmsAssetSizesNoBase64 = graphql`
  fragment GatsbyDatoCmsSizes_noBase64 on DatoCmsSizes {
    aspectRatio
    src
    srcSet
    sizes
  }
`
