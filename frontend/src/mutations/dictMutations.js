import { gql } from "@apollo/client";

const CREATE_DICT = gql`
  mutation CreateDict($hash: String!, $lang: String!, $text: String!) {
    createDict(hash: $hash, lang: $lang, text: $text)
  }
`;

const CREATE_MOREDICT = gql`
  mutation CreateMoreDict($texts: String!, $lang: String!) {
    createMoreDict(texts: $texts, lang: $lang)
  }
`;

export { CREATE_DICT, CREATE_MOREDICT };
