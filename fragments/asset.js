import { graphql } from 'gatsby';

export const datoCmsAssetResolutions = graphql`
  fragment GatsbyDatoCmsResolutions on DatoCmsFixed {
    base64
    width
    height
    src
    srcSet
  }
`

export const datoCmsAssetResolutionsTracedSVG = graphql`
  fragment GatsbyDatoCmsResolutions_tracedSVG on DatoCmsFixed {
    tracedSVG
    width
    height
    src
    srcSet
  }
`

export const datoCmsAssetResolutionsNoBase64 = graphql`
  fragment GatsbyDatoCmsResolutions_noBase64 on DatoCmsFixed {
    width
    height
    src
    srcSet
  }
`

export const datoCmsAssetSizes = graphql`
  fragment GatsbyDatoCmsSizes on DatoCmsFluid {
    base64
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const datoCmsAssetSizesTracedSVG = graphql`
  fragment GatsbyDatoCmsSizes_tracedSVG on DatoCmsFluid {
    tracedSVG
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const datoCmsAssetSizesNoBase64 = graphql`
  fragment GatsbyDatoCmsSizes_noBase64 on DatoCmsFluid {
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const datoCmsAssetFixed = graphql`
  fragment GatsbyDatoCmsFixed on DatoCmsFixed {
    base64
    width
    height
    aspectRatio
    src
    srcSet
  }
`

export const datoCmsAssetFixedTracedSVG = graphql`
  fragment GatsbyDatoCmsFixed_tracedSVG on DatoCmsFixed {
    tracedSVG
    width
    height
    aspectRatio
    src
    srcSet
  }
`

export const datoCmsAssetFixedNoBase64 = graphql`
  fragment GatsbyDatoCmsFixed_noBase64 on DatoCmsFixed {
    width
    height
    src
    srcSet
    aspectRatio
  }
`

export const datoCmsAssetFluid = graphql`
  fragment GatsbyDatoCmsFluid on DatoCmsFluid {
    base64
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const datoCmsAssetFluidTracedSVG = graphql`
  fragment GatsbyDatoCmsFluid_tracedSVG on DatoCmsFluid {
    tracedSVG
    aspectRatio
    src
    srcSet
    sizes
  }
`

export const datoCmsAssetFluidNoBase64 = graphql`
  fragment GatsbyDatoCmsFluid_noBase64 on DatoCmsFluid {
    aspectRatio
    src
    srcSet
    sizes
  }
`
