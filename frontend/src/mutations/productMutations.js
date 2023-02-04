import { gql } from "@apollo/client";

const CREATE_PRODUCT = gql`
  mutation createProduct($name: String!, $shortId: String!, $quantity: Int!) {
    createProduct(name: $name, shortId: $shortId, quantity: $quantity) {
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
const UPDATE_PRODUCT = gql`
  mutation update($id: ID!, $name: String, $shortId: String, $quantity: Int) {
    updateProduct(id: $id, name: $name, shortId: $shortId, quantity: $quantity)
  }
`;
const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
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
const RESTOREDELETED_PRODUCT = gql`
  mutation RestoreDeletedProduct($id: ID!) {
    restoreDeletedProduct(id: $id) {
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
const REMOVE_PRODUCT = gql`
  mutation RemoveProduct($id: ID!) {
    removeProduct(id: $id) {
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

export {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  RESTOREDELETED_PRODUCT,
  REMOVE_PRODUCT,
};
