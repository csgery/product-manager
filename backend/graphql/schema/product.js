export default `#graphql
  type Product {
    id: ID!
    name: String!
    shortId: String!
    quantity: Int!
    description: String
    image: String
    createdAt: String!
    updatedAt: String!
    valid: Boolean!
    createdBy: String!
    updatedBy: String!
  }

  type ProductWithUserData {
    id: ID!
    name: String!
    shortId: String!
    quantity: Int!
    createdAt: String!
    updatedAt: String!
    valid: Boolean!
    createdBy: [String!]
    updatedBy: [String!]
  }

  extend type Query {
    validProducts: [Product!]! # [Product!]! after DB CONN
    deletedProducts: [Product!]!
    # products: [Product!]!
    product(id: ID!): Product!
  }

  extend type Mutation {
    createProduct(name: String!, shortId: String!, quantity: Int!, description: String, image: String): Product!
    updateProduct(
      id: ID!
      name: String
      shortId: String
      quantity: Int
      description: String 
      image: String
    ): String!
    deleteProduct(id: ID!): Product!
    restoreDeletedProduct(id: ID!): Product!
    removeProduct(id: ID!): Product!
  }
`;
