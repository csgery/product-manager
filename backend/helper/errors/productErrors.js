import { GraphQLError } from "graphql";
// import customError from "../errors/customError.js";
import {
  translateError,
  productErrorCodes as errorCodes,
  errorCodePrefix as prefix,
} from "../helper.js";

// TODO: string error code instead of int (like: 'INVALID_CREDS')
const productNotFound_Error = async (lang) =>
  new GraphQLError(
    (await translateError("Product not found!", lang)) +
      prefix +
      errorCodes.productNotFound,
    {
      extensions: { code: -1 },
    }
  );
const productSoftDeleteFirst_Error = async (lang) =>
  new GraphQLError(
    (await translateError("Delete first!", lang)) +
      prefix +
      errorCodes.productDeleteFirst,
    {
      extensions: { code: -2 },
    }
  );
const productAlreadySoftDeleted_Error = async (lang) =>
  new GraphQLError(
    (await translateError("The product's already deleted!", lang)) +
      prefix +
      errorCodes.productAlreadyDeleted,
    {
      extensions: { code: -3 },
    }
  );
const productAlreadyValid_Error = async (lang) =>
  new GraphQLError(
    (await translateError("The product's already set to valid!", lang)) +
      prefix +
      errorCodes.productAlreadyRestored,
    {
      extensions: { code: -4 },
    }
  );
const productNotChanged_Error = async (lang) =>
  new GraphQLError(
    (await translateError(
      "There is no changes, but the log entry has created!",
      lang
    )) +
      prefix +
      errorCodes.productEmptyUpdate,
    {
      extensions: { code: -5 },
    }
  );
const productExistedShortId_Error = async (lang) => {
  // console.log("lang type inside error:", typeof lang);
  //const translatedMessage = await translateError("This shortId exists!", lang);
  // console.log("inside error:", translatedMessage);
  return new GraphQLError(
    (await translateError("This shortId exists!", lang)) +
      prefix +
      errorCodes.productExistedShortID,
    {
      extensions: { code: -6 },
    }
  );
};
// const productExistedShortId_Error = () =>
//   new customError("This shortId exists!edited edited", "CODE!!!", {
//     extensions: { code: -6 },
//   });

export {
  productNotFound_Error,
  productSoftDeleteFirst_Error,
  productAlreadySoftDeleted_Error,
  productAlreadyValid_Error,
  productNotChanged_Error,
  productExistedShortId_Error,
};
