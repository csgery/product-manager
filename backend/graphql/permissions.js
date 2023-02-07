import { and, or, rule, shield, not } from "graphql-shield";
import Product from "./../models/product.js";
import User from "./../models/user.js";
import {
  userShouldReLogin_Error,
  userLoginFirst_Error,
  userExpiredAccessJWT_Error,
  userExpiredRefreshJWT_Error,
} from "../helper/errors/userErrors.js";

export const PERMS = {
  // basic permission
  protected: "protected",

  // users
  readOwn_user: "read:own_user",
  readValid_users: "read:valid_users",
  readInvalid_users: "read:invalid_users",
  insertAny_user: "insert:any_user",
  //updateAny_user: "update:any_user", //update only yourself
  updateUser_permissions: "update:user_permissions",
  softdeleteAny_user: "softdelete:any_user",
  restoreSoftdelete_user: "restoreSoftdelete:user",
  deleteAny_user: "delete:any_user",

  // products
  readValid_products: "read:valid_products",
  readInvalid_products: "read:invalid_products",
  insertAny_product: "insert:any_product",
  updateAny_product: "update:any_product",
  softdeleteAny_product: "softdelete:any_product",
  restoreSoftdelete_product: "restoreSoftdelete:product",
  deleteAny_product: "delete:any_product",
};

export const PERMS_DEPENDENCIES = {
  // users
  [PERMS.readOwn_user]: [],
  [PERMS.readValid_users]: [PERMS.readOwn_user],
  [PERMS.readInvalid_users]: [PERMS.readValid_users],

  // [PERMS.insertAny_user]: [PERMS.readAny_user],
  //update only yourself
  //[PERMS.updateAny_user]: [PERMS.insertAny_user],
  [PERMS.insertAny_user]: [PERMS.readValid_users],
  [PERMS.softdeleteAny_user]: [PERMS.readInvalid_users],
  [PERMS.restoreSoftdelete_user]: [PERMS.softdeleteAny_user],
  [PERMS.deleteAny_user]: [PERMS.softdeleteAny_user],

  [PERMS.updateUser_permissions]: [PERMS.readInvalid_users],

  // products
  [PERMS.readValid_products]: [],
  [PERMS.readInvalid_products]: [PERMS.readValid_products],
  [PERMS.insertAny_product]: [PERMS.readValid_products],
  [PERMS.updateAny_product]: [PERMS.insertAny_product],
  [PERMS.softdeleteAny_product]: [PERMS.insertAny_product],
  [PERMS.restoreSoftdelete_product]: [PERMS.softdeleteAny_product],
  [PERMS.deleteAny_product]: [PERMS.softdeleteAny_product],
};

async function checkPermission(user, permission, lang) {
  // TODO: copy-paste START
  if (!user) {
    return userLoginFirst_Error(lang);
  }
  if (user.expiredAccessToken_Redirect) {
    return userExpiredAccessJWT_Error(lang);
  }
  if (user.expiredAccessToken_ReLogin) {
    return userShouldReLogin_Error(lang);
  }
  if (!user.sub) {
    return userLoginFirst_Error(lang);
  }
  if (await shouldUserReLogin(user)) {
    return userShouldReLogin_Error(lang);
  }
  // TODO: copy-paste END
  if (user && user[process.env.JWT_TOKEN_SCOPE]) {
    return user[process.env.JWT_TOKEN_SCOPE].permissions.includes(permission);
  }
  return false;
}

const shouldUserReLogin = async (user) => {
  const userFromDB = await User.findById(user.sub);
  console.log(userFromDB.shouldUserReLogin);
  return userFromDB.shouldUserReLogin;
};

const isAuthenticated = rule()(async (parent, args, { user, req }) => {
  // TODO: copy-paste START
  const lang = req.headers.language || "en";
  if (!user) {
    return userLoginFirst_Error(lang);
  }
  if (user.expiredAccessToken_Redirect) {
    return userExpiredAccessJWT_Error(lang);
  }
  if (user.expiredAccessToken_ReLogin) {
    return userShouldReLogin_Error(lang);
  }
  if (!user.sub) {
    return userLoginFirst_Error(lang);
  }
  if (await shouldUserReLogin(user)) {
    return userShouldReLogin_Error(lang);
  }
  // TODO: copy-paste END
  return user !== null && user !== undefined;
});

// Users
const canReadValidUsers = rule()((parent, args, { user, req }) => {
  try {
    return checkPermission(user, PERMS.readValid_users);
  } catch (err) {
    throw err;
  }
});

const canReadInvalidUsers = rule()((parent, args, { user, req }) => {
  try {
    return checkPermission(user, PERMS.readInvalid_users);
  } catch (err) {
    throw err;
  }
});

const canReadOwnUser = rule()((parent, args, { user, req }) => {
  const lang = req.headers.language || "en";
  return checkPermission(user, PERMS.readOwn_user, lang);
});

const isReadingOwnUser = rule()((parent, { id }, { user }) => {
  return user && user.sub === id;
});

const canCreateUser = rule()((parent, args, { user, req }) => {
  const lang = req.headers.language || "en";
  return checkPermission(user, PERMS.insertAny_user, lang);
});

const canUpdateUserPermissions = rule()((parent, args, { user, req }) => {
  const lang = req.headers.language || "en";
  return checkPermission(user, PERMS.updateUser_permissions, lang);
});

const canSoftdeleteAnyUser = rule()((parent, args, { user, req }) => {
  const lang = req.headers.language || "en";
  return checkPermission(user, PERMS.softdeleteAny_user, lang);
});

const canRestoreSoftdeleteUser = rule()((parent, args, { user, req }) => {
  const lang = req.headers.language || "en";
  return checkPermission(user, PERMS.restoreSoftdelete_user, lang);
});

const canDeleteAnyUser = rule()((parent, args, { user, req }) => {
  const lang = req.headers.language || "en";
  return checkPermission(user, PERMS.deleteAny_user, lang);
});

// Products
const canReadInvalidProducts = rule()((parent, args, { user, req }) => {
  const lang = req.headers.language || "en";
  return checkPermission(user, PERMS.readInvalid_products, lang);
});

const isOwnProduct = rule()(async (parent, { id }, { user }) => {
  const product = await Product.findById(id);
  if (!product) {
    return false;
  }
  return product.createdBy === user.username;
});

const canUpdateAnyProduct = rule()((parent, args, { user, req }) => {
  const lang = req.headers.language || "en";
  return checkPermission(user, PERMS.updateAny_product, lang);
});

const canSoftdeleteAnyProduct = rule()((parent, args, { user, req }) => {
  const lang = req.headers.language || "en";
  return checkPermission(user, PERMS.softdeleteAny_product, lang);
});

const canRestoreSoftdeleteProduct = rule()((parent, args, { user, req }) => {
  const lang = req.headers.language || "en";
  return checkPermission(user, PERMS.restoreSoftdelete_product, lang);
});

const canDeleteAnyProduct = rule()((parent, args, { user, req }) => {
  const lang = req.headers.language || "en";
  return checkPermission(user, PERMS.deleteAny_product, lang);
});

export default shield(
  {
    Query: {
      user: or(and(canReadOwnUser, isReadingOwnUser), canReadValidUsers),
      deletedUsers: canReadInvalidUsers,
      validUsers: canReadValidUsers,
      viewer: isAuthenticated,

      validProducts: isAuthenticated,
      deletedProducts: canReadInvalidProducts,
      //products: canReadInvalidProducts,
      product: isAuthenticated,
      //TODO: isAuthenticated not check if a user should re login or banned -> its checked inside login resolver
    },
    Mutation: {
      createUser: canCreateUser,
      changePassword: isReadingOwnUser,
      updateUser: isReadingOwnUser,
      updatePermission: canUpdateUserPermissions,
      deleteUser: and(canSoftdeleteAnyUser, not(isReadingOwnUser)),
      restoreUser: and(canRestoreSoftdeleteUser, not(isReadingOwnUser)),
      removeUser: and(canDeleteAnyUser, not(isReadingOwnUser)),
      invalidateTokens: isAuthenticated,
      //refreshToken: isAuthenticated,

      createProduct: isAuthenticated,
      updateProduct: or(isOwnProduct, canUpdateAnyProduct),
      deleteProduct: canSoftdeleteAnyProduct,
      restoreDeletedProduct: canRestoreSoftdeleteProduct,
      removeProduct: canDeleteAnyProduct,
    },
  },
  {
    allowExternalErrors: true,
  }
);
