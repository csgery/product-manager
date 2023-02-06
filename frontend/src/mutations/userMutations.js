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

export { LOGIN_USER, REFRESH_TOKEN };
