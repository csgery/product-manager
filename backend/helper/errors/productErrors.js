import { GraphQLError } from "graphql";
import customError from "../errors/customError.js";
import { translateError } from "../helper.js";

// TODO: string error code instead of int (like: 'INVALID_CREDS')
const productNotFound_Error = () =>
  new GraphQLError("Product not found!$PRODUCT_NOT_FOUND", {
    extensions: { code: -1 },
  });
const productSoftDeleteFirst_Error = () =>
  new GraphQLError("Delete first!$DELETE_FIRST", {
    extensions: { code: -2 },
  });
const productAlreadySoftDeleted_Error = () =>
  new GraphQLError("The product's already deleted$ALREADY_DELETED", {
    extensions: { code: -3 },
  });
const productAlreadyValid_Error = () =>
  new GraphQLError("The product's already set to valid$ALREADY_RESTORED", {
    extensions: { code: -4 },
  });
const productNotChanged_Error = () =>
  new GraphQLError(
    "There is no changes, but the log entry has created!$EMPTY_UPDATE",
    {
      extensions: { code: -5 },
    }
  );
const productExistedShortId_Error = async (lang) => {
  console.log("lang type inside error:", typeof lang);
  const translatedMessage = await translateError("This shortId exists!", lang);
  console.log("inside error:", translatedMessage);
  return new GraphQLError(translatedMessage + "$EXISTED_SHORTID", {
    extensions: { code: -6 },
  });
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
