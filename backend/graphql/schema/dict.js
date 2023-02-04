import { GraphQLObjectType } from "graphql";
export default `#graphql
  # type Dict {
  #   id: ID!
  #   hash: Int!
  #   dicts: Object
  # }
  
  extend type Query {
    getDict(hash: String!, lang: String!): String
    # it'll return an object, but GQL doesn't like objects as type so I stringifyed that (and the hashes too)
    getMoreDict(hashes: String!, lang: String!): String! 
  } 

  extend type Mutation {
    createDict(hash: String!, lang: String!, text: String!): String!
    createMoreDict(texts: String!, lang: String!): String!
  }
`;
