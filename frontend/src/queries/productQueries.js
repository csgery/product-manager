import { gql } from "@apollo/client";

const GET_VALIDPRODUCTS = gql`
  query ValidProducts {
    validProducts {
      id
      name
      shortId
      createdAt
      createdBy
      quantity
      updatedAt
      updatedBy
      valid
    }
  }
`;

const GET_DELETEDPRODUCTS = gql`
  query DeletedProducts {
    deletedProducts {
      id
      name
      shortId
      createdAt
      createdBy
      quantity
      updatedAt
      updatedBy
      valid
    }
  }
`;

const GET_PRODUCT = gql`
  query Product($id: ID!) {
    product(id: $id) {
      id
      name
      shortId
      createdAt
      createdBy
      quantity
      updatedAt
      updatedBy
      valid
    }
  }
`;

export { GET_VALIDPRODUCTS, GET_PRODUCT, GET_DELETEDPRODUCTS };
