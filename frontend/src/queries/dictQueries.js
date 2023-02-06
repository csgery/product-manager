import { gql } from "@apollo/client";

const GET_DICT = gql`
  query GetDict($hash: String!, $lang: String!) {
    getDict(hash: $hash, lang: $lang)
  }
`;

const GET_MOREDICT = gql`
  query GetMoreDict($hashes: String!, $lang: String!) {
    getMoreDict(hashes: $hashes, lang: $lang)
  }
`;

export { GET_DICT, GET_MOREDICT };
