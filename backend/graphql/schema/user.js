export default `#graphql
  type User {
    id: ID!
    username: String!
    email: String!
    createdAt: String!
    updatedAt: String!
    permissions: [String!]
    shouldUserReLogin: Boolean!
    CFT: Int!
    canLogin: Boolean!
    valid: Boolean!
    createdBy: String!
    updatedBy: String!
  }
  
  extend type Query {
    validUsers: [User!]!
    deletedUsers: [User!]!
    user(id: ID!): User!
    viewer: User!
  }

  extend type Mutation {
    createAdmin: User!
    checkPermValidationTime(count: Int!): [String!]!
    createUser(username: String!, email: String!, password: String!, permissions: [String!]): User!
    changePassword(id: ID!, currentPassword: String!, newPassword: String!): String!
    updateUser(
      id: ID!
      email: String!
    ): String!
    updatePermission(arrayString: [String!]!): String!
    deleteUser(id: ID!): String!
    restoreUser(id: ID!): String!
    blockUser(id: ID!): String!
    unblockUser(id: ID!): String!
    removeUser(id: ID!): String!

    login(email: String!, password: String!): [String!]!
    invalidateTokens: Boolean!
    refreshToken: [String!]!
  }
`;
