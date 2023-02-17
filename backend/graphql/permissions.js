import { and, or, rule, shield, not } from "graphql-shield";
import Product from "./../models/product.js";
import User from "./../models/user.js";
import {
  userShouldReLogin_Error,
  userLoginFirst_Error,
  userExpiredAccessJWT_Error,
  userExpiredRefreshJWT_Error,
} from "../helper/errors/userErrors.js";

export const auth = {
  PERMS: {
    // products
    readValid_products: "read:valid_products",
    readInvalid_products: "read:invalid_products",
    insert_product: "insert:product",
    update_product: "update:product",
    delete_product: "delete:product",
    restore_product: "restore:product",
    remove_product: "remove:product",

    // users
    readOwn_user: "read:own_user",
    readValid_users: "read:valid_users",
    readInvalid_users: "read:invalid_users",
    insert_user: "insert:user",
    //updateAny_user: "update:any_user", //update only yourself
    updateUser_permissions: "update:user_permissions",
    delete_user: "delete:user",
    restore_user: "restore:user",
    remove_user: "remove:user",
    // basic permission
    protected: "protected",
    owner: "owner",
  },
};

export const PERMS_DEPENDENCIES = {
  // users
  [auth.PERMS.readOwn_user]: [],
  [auth.PERMS.protected]: [],
  [auth.PERMS.owner]: [auth.PERMS.protected],
  [auth.PERMS.readValid_users]: [auth.PERMS.readOwn_user],
  [auth.PERMS.readInvalid_users]: [auth.PERMS.readValid_users],

  // [auth.PERMS.insertAny_user]: [auth.PERMS.readAny_user],
  //update only yourself
  //[auth.PERMS.updateAny_user]: [auth.PERMS.insertAny_user],
  [auth.PERMS.insert_user]: [auth.PERMS.readValid_users],
  [auth.PERMS.delete_user]: [auth.PERMS.readInvalid_users],
  [auth.PERMS.restore_user]: [auth.PERMS.delete_user],
  [auth.PERMS.remove_user]: [auth.PERMS.delete_user],

  [auth.PERMS.updateUser_permissions]: [auth.PERMS.readInvalid_users],

  // products
  [auth.PERMS.readValid_products]: [],
  [auth.PERMS.readInvalid_products]: [auth.PERMS.readValid_products],
  [auth.PERMS.insert_product]: [auth.PERMS.readValid_products],
  [auth.PERMS.update_product]: [auth.PERMS.insert_product],
  [auth.PERMS.delete_product]: [auth.PERMS.readInvalid_products],
  [auth.PERMS.restore_product]: [auth.PERMS.delete_product],
  [auth.PERMS.remove_product]: [auth.PERMS.delete_product],
};

async function checkPermission(user, permission, lang) {
  // TODO: copy-paste START
  if (!lang) {
    lang = "en";
  }
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
  const lang = req?.headers?.language || "en";
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
    return checkPermission(user, auth.PERMS.readValid_users);
  } catch (err) {
    throw err;
  }
});

const canReadInvalidUsers = rule()((parent, args, { user, req }) => {
  try {
    return checkPermission(user, auth.PERMS.readInvalid_users);
  } catch (err) {
    throw err;
  }
});

const canReadOwnUser = rule()((parent, args, { user, req }) => {
  const lang = req?.headers?.language || "en";
  return checkPermission(user, auth.PERMS.readOwn_user, lang);
});

const isReadingOwnUser = rule()((parent, { id }, { user }) => {
  return user && user.sub === id;
});

const canCreateUser = rule()((parent, args, { user, req }) => {
  const lang = req?.headers?.language || "en";
  return checkPermission(user, auth.PERMS.insert_user, lang);
});

const canUpdateUserPermissions = rule()((parent, args, { user, req }) => {
  const lang = req?.headers?.language || "en";
  return checkPermission(user, auth.PERMS.updateUser_permissions, lang);
});

const canDeleteUser = rule()((parent, args, { user, req }) => {
  const lang = req?.headers?.language || "en";
  return checkPermission(user, auth.PERMS.delete_user, lang);
});

const canRestoreUser = rule()((parent, args, { user, req }) => {
  const lang = req?.headers?.language || "en";
  return checkPermission(user, auth.PERMS.restore_user, lang);
});

const canRemoveUser = rule()((parent, args, { user, req }) => {
  const lang = req?.headers?.language || "en";
  return checkPermission(user, auth.PERMS.remove_user, lang);
});

// Products
const canReadInvalidProducts = rule()((parent, args, { user, req }) => {
  const lang = req?.headers?.language || "en";
  return checkPermission(user, auth.PERMS.readInvalid_products, lang);
});

const isOwnProduct = rule()(async (parent, { id }, { user }) => {
  const product = await Product.findById(id);
  if (!product) {
    return false;
  }
  return product.createdBy === user.username;
});

const canUpdateProduct = rule()((parent, args, { user, req }) => {
  const lang = req?.headers?.language || "en";
  return checkPermission(user, auth.PERMS.update_product, lang);
});

const canDeleteProduct = rule()((parent, args, { user, req }) => {
  const lang = req?.headers?.language || "en";
  return checkPermission(user, auth.PERMS.delete_product, lang);
});

const canRestoreProduct = rule()((parent, args, { user, req }) => {
  const lang = req?.headers?.language || "en";
  return checkPermission(user, auth.PERMS.restore_product, lang);
});

const canRemoveProduct = rule()((parent, args, { user, req }) => {
  const lang = req?.headers?.language || "en";
  return checkPermission(user, auth.PERMS.remove_product, lang);
});

const canBlockUser = rule()((parent, args, { user, req }) => {
  const lang = req?.headers?.language || "en";
  return checkPermission(user, auth.PERMS.updateUser_permissions, lang);
});

const canUnblockUser = rule()((parent, args, { user, req }) => {
  const lang = req?.headers?.language || "en";
  return checkPermission(user, auth.PERMS.updateUser_permissions, lang);
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
      deleteUser: and(canDeleteUser, not(isReadingOwnUser)),
      restoreUser: and(canRestoreUser, not(isReadingOwnUser)),
      removeUser: and(canRemoveUser, not(isReadingOwnUser)),
      invalidateTokens: isAuthenticated,
      blockUser: canBlockUser,
      unblockUser: canUnblockUser,
      //refreshToken: isAuthenticated,

      createProduct: isAuthenticated,
      updateProduct: or(isOwnProduct, canUpdateProduct),
      deleteProduct: canDeleteProduct,
      restoreDeletedProduct: canRestoreProduct,
      removeProduct: canRemoveProduct,
    },
  },
  {
    allowExternalErrors: true,
  }
);
