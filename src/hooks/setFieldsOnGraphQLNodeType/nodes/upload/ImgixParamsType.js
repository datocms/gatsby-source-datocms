const imgixParams = require('imgix-url-params/dist/parameters');
const { camelize } = require('humps');

const {
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
} = require('gatsby/graphql');

const objectEntries =  require('object.entries');

const fields = {};

const mappings = {
  boolean: GraphQLBoolean,
  hex_color: GraphQLString,
  integer: GraphQLInt,
  list: GraphQLString,
  number: GraphQLFloat,
  path: GraphQLString,
  string: GraphQLString,
  timestamp: GraphQLString,
  unit_scalar: GraphQLFloat,
  url: GraphQLString,
}

objectEntries(imgixParams.parameters).forEach(([param, doc]) => {
  fields[camelize(param)] = {
    type: doc.expects.length === 1 ?
      mappings[doc.expects[0].type] :
      GraphQLString,
    description: `${doc.short_description} (${doc.url})`,
  }
});

module.exports = new GraphQLInputObjectType({
  name: `DatoCmsImgixParams`,
  fields
});
