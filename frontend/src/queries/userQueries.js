import { gql } from "@apollo/client";

const VIEWER = gql`
  query Viewer {
    viewer {
      id
      username
      email
      permissions
      image
      shouldUserReLogin
      createdAt
      permissions
      canLogin
      valid
    }
  }
`;

const GET_USER = gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      username
      email
      createdAt
      updatedAt
      permissions
      image
      shouldUserReLogin
      CFT
      canLogin
      valid
      createdBy
      updatedBy
    }
  }
`;

const GET_VALIDUSERS = gql`
  query ValidUsers {
    validUsers {
      id
      username
      email
      permissions
      image
      createdBy
      shouldUserReLogin
      canLogin
      valid
    }
  }
`;

const GET_DELETEDUSERS = gql`
  query DeletedUsers {
    deletedUsers {
      id
      username
      email
      permissions
      image
      createdBy
      shouldUserReLogin
      canLogin
      valid
    }
  }
`;

export { VIEWER, GET_USER, GET_VALIDUSERS, GET_DELETEDUSERS };
