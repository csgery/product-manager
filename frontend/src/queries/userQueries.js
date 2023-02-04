import { gql } from "@apollo/client";

const VIEWER = gql`
  query Viewer {
    viewer {
      id
      username
      email
      permissions
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
      shouldUserReLogin
      CFT
      canLogin
      valid
      createdBy
      updatedBy
    }
  }
`;

export { VIEWER, GET_USER };
