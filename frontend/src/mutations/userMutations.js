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
  mutation CreateUser($username: String!, $email: String!, $password: String!) {
    createUser(
      username: $username
      email: $email
      password: $password
      permissions: ["read:own_user"]
    ) {
      id
      username
      email
      permissions
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $email: String!) {
    updateUser(id: $id, email: $email)
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

export {
  LOGIN_USER,
  REFRESH_TOKEN,
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  RESTORE_USER,
  REMOVE_USER,
};
