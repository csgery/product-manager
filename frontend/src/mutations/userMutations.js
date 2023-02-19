import { gql } from "@apollo/client";

const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken
  }
`;

const CREATE_USER = gql`
  mutation CreateUser(
    $username: String!
    $email: String!
    $password: String!
    $image: String
  ) {
    createUser(
      username: $username
      email: $email
      password: $password
      permissions: ["read:own_user"]
      image: $image
    ) {
      id
      username
      email
      permissions
      image
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $email: String!) {
    updateUser(id: $id, email: $email)
  }
`;

const UPDATE_PERMISSIONS = gql`
  mutation UpdatePermission($arrayString: [String!]!) {
    updatePermission(arrayString: $arrayString)
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;
const RESTORE_USER = gql`
  mutation RestoreUser($id: ID!) {
    restoreUser(id: $id)
  }
`;
const REMOVE_USER = gql`
  mutation RemoveUser($id: ID!) {
    removeUser(id: $id)
  }
`;

const BLOCK_USER = gql`
  mutation BlockUser($id: ID!) {
    blockUser(id: $id)
  }
`;

const UNBLOCK_USER = gql`
  mutation UnblockUser($id: ID!) {
    unblockUser(id: $id)
  }
`;

export {
  LOGIN_USER,
  REFRESH_TOKEN,
  CREATE_USER,
  UPDATE_USER,
  UPDATE_PERMISSIONS,
  DELETE_USER,
  RESTORE_USER,
  REMOVE_USER,
  BLOCK_USER,
  UNBLOCK_USER,
};
