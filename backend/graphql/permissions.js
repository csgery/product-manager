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
  readAny_user: "read:any_user",
  readInvalid_users: "read:invalid_users",
  insertAny_user: "insert:any_user",
  //updateAny_user: "update:any_user", //update only yourself
  updateUser_permissions: "update:user_permissions",
  softdeleteAny_user: "softdelete:any_user",
  restoreSoftdelete_user: "restoreSoftdelete:user",
  deleteAny_user: "delete:any_user",

  // products
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
  [PERMS.readAny_user]: [PERMS.readOwn_user],
  [PERMS.readInvalid_users]: [PERMS.readAny_user],

  [PERMS.insertAny_user]: [PERMS.readAny_user],
  //update only yourself
  //[PERMS.updateAny_user]: [PERMS.insertAny_user],
  [PERMS.insertAny_user]: [PERMS.readAny_user],
  [PERMS.softdeleteAny_user]: [PERMS.readInvalid_users],
  [PERMS.restoreSoftdelete_user]: [PERMS.softdeleteAny_user],
  [PERMS.deleteAny_user]: [PERMS.softdeleteAny_user],

  [PERMS.updateUser_permissions]: [PERMS.readInvalid_users],

  // products
  [PERMS.readInvalid_products]: [],
  [PERMS.insertAny_product]: [PERMS.readInvalid_products],
  [PERMS.updateAny_product]: [PERMS.insertAny_product],
  [PERMS.softdeleteAny_product]: [PERMS.readInvalid_products],
  [PERMS.restoreSoftdelete_product]: [PERMS.softdeleteAny_product],
  [PERMS.deleteAny_product]: [PERMS.softdeleteAny_product],
};

async function checkPermission(user, permission) {
  // TODO: copy-paste START
  if (!user) {
    return userLoginFirst_Error();
  }
  if (user.expiredAccessToken_Redirect) {
    return userExpiredAccessJWT_Error();
  }
  if (user.expiredAccessToken_ReLogin) {
    return userShouldReLogin_Error();
  }
  if (!user.sub) {
    return userLoginFirst_Error();
  }
  if (await shouldUserReLogin(user)) {
    return userShouldReLogin_Error();
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

const isAuthenticated = rule()(async (parent, args, { user }) => {
  // TODO: copy-paste START
  if (!user) {
    return userLoginFirst_Error();
  }
  if (user.expiredAccessToken_Redirect) {
    return userExpiredAccessJWT_Error();
  }
  if (user.expiredAccessToken_ReLogin) {
    return userShouldReLogin_Error();
  }
  if (!user.sub) {
    return userLoginFirst_Error();
  }
  if (await shouldUserReLogin(user)) {
    return userShouldReLogin_Error();
  }
  // TODO: copy-paste END
  return user !== null && user !== undefined;
});

// Users
const canReadAnyUser = rule()((parent, args, { user }) => {
  try {
    return checkPermission(user, PERMS.readAny_user);
  } catch (err) {
    throw err;
  }
});

const canReadOwnUser = rule()((parent, args, { user }) => {
  return checkPermission(user, PERMS.readOwn_user);
});

const isReadingOwnUser = rule()((parent, { id }, { user }) => {
  return user && user.sub === id;
});

const canCreateUser = rule()((parent, args, { user }) => {
  return checkPermission(user, PERMS.insertAny_user);
});

const canUpdateUserPermissions = rule()((parent, args, { user }) => {
  return checkPermission(user, PERMS.updateUser_permissions);
});

const canSoftdeleteAnyUser = rule()((parent, args, { user }) => {
  return checkPermission(user, PERMS.softdeleteAny_user);
});

const canRestoreSoftdeleteUser = rule()((parent, args, { user }) => {
  return checkPermission(user, PERMS.restoreSoftdelete_user);
});

const canDeleteAnyUser = rule()((parent, args, { user }) => {
  return checkPermission(user, PERMS.deleteAny_user);
});

// Products
const canReadInvalidProducts = rule()((parent, args, { user }) => {
  return checkPermission(user, PERMS.readInvalid_products);
});

const isOwnProduct = rule()(async (parent, { id }, { user }) => {
  const product = await Product.findById(id);
  if (!product) {
    return false;
  }
  return product.createdBy === user.username;
});

const canUpdateAnyProduct = rule()((parent, args, { user }) => {
  return checkPermission(user, PERMS.updateAny_product);
});

const canSoftdeleteAnyProduct = rule()((parent, args, { user }) => {
  return checkPermission(user, PERMS.softdeleteAny_product);
});

const canRestoreSoftdeleteProduct = rule()((parent, args, { user }) => {
  return checkPermission(user, PERMS.restoreSoftdelete_product);
});

const canDeleteAnyProduct = rule()((parent, args, { user }) => {
  return checkPermission(user, PERMS.deleteAny_product);
});

export default shield(
  {
    Query: {
      user: or(and(canReadOwnUser, isReadingOwnUser), canReadAnyUser),
      users: canReadAnyUser,
      validUsers: canReadAnyUser,
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
      softDeleteUser: and(canSoftdeleteAnyUser, not(isReadingOwnUser)),
      restoreSoftDeleteUser: and(
        canRestoreSoftdeleteUser,
        not(isReadingOwnUser)
      ),
      deleteUser: and(canDeleteAnyUser, not(isReadingOwnUser)),
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
