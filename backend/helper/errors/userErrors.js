import { GraphQLError } from "graphql";
import {
  translateError,
  userErrorCodes as errorCodes,
  errorCodePrefix as prefix,
} from "../helper.js";

// TODO: string error code instead of int (like: 'INVALID_CREDS')
const userNotFound_Error = async (lang) =>
  new GraphQLError(
    (await translateError("User not found!", lang)) +
      prefix +
      errorCodes.userNotFound,
    {
      extensions: { code: -21 },
    }
  );
const userSoftDeleteFirst_Error = async (lang) =>
  new GraphQLError(
    (await translateError("Soft delete first!", lang)) +
      prefix +
      errorCodes.userDeleteFirst,
    {
      extensions: { code: -22 },
    }
  );
const userAlreadySoftDeleted_Error = async (lang) =>
  new GraphQLError(
    (await translateError("The user's already soft deleted!", lang)) +
      prefix +
      errorCodes.userAlreadyDeleted,
    {
      extensions: { code: -23 },
    }
  );
const userAlreadyValid_Error = async (lang) =>
  new GraphQLError(
    (await translateError("The user's already set to valid!", lang)) +
      prefix +
      errorCodes.userAlreadyRestored,
    {
      extensions: { code: -24 },
    }
  );
const userNotChanged_Error = async (lang) =>
  new GraphQLError(
    (await translateError(
      "There is no changes, but the log entry has created!",
      lang
    )) +
      prefix +
      errorCodes.userEmptyUpdate,
    {
      extensions: { code: -25 },
    }
  );
const userEmailAlreadyExist_Error = async (lang) =>
  new GraphQLError(
    (await translateError("This email is already exist!", lang)) +
      prefix +
      errorCodes.userEmailExists,
    {
      extensions: { code: -26 },
    }
  );
const userUsernameAlreadyExist_Error = async (lang) =>
  new GraphQLError(
    (await translateError("This username is already exist!", lang)) +
      prefix +
      errorCodes.userUsernameExists,
    {
      extensions: { code: -26 },
    }
  );
const userIsProtected = async (lang) =>
  new GraphQLError(
    (await translateError(
      "This user is protected, every manipulation is forbidden!",
      lang
    )) +
      prefix +
      errorCodes.userProtectionViolation,
    {
      extensions: { code: -27 },
    }
  );
const userPWRegex_Error = async (lang) =>
  new GraphQLError(
    (await translateError("This password format is invalid!", lang)) +
      prefix +
      errorCodes.userInvalidPasswordFormat,
    {
      extensions: { code: -28 },
    }
  );
const userEmailRegex_Error = async (lang) =>
  new GraphQLError(
    (await translateError("This email format is invalid!", lang)) +
      prefix +
      errorCodes.userInvalidEmailFormat,
    {
      extensions: { code: -29 },
    }
  );
const userShouldReLogin_Error = async (lang) =>
  new GraphQLError(
    (await translateError("Please log in again!", lang)) +
      prefix +
      errorCodes.userShouldReLogin,
    {
      extensions: { code: -30 },
    }
  );
const userLoginBlocked_Error = async (lang) =>
  new GraphQLError(
    (await translateError(
      "You can no longer login, please contact an administrator!",
      lang
    )) +
      prefix +
      errorCodes.userLoginBlocked,
    { extensions: { code: -31 } }
  );
const userAlreadyBlocked_Error = async (lang) =>
  new GraphQLError(
    (await translateError("The user's already blocked!", lang)) +
      prefix +
      errorCodes.userAlreadyBlocked,
    {
      extensions: { code: -32 },
    }
  );
const userAlreadyUnblocked_Error = async (lang) =>
  new GraphQLError(
    (await translateError("The user's already unblocked!", lang)) +
      prefix +
      errorCodes.userAlreadyUnBlocked,
    {
      extensions: { code: -33 },
    }
  );
const userLoginFirst_Error = async (lang) =>
  new GraphQLError(
    (await translateError("Please log in first!", lang)) +
      prefix +
      errorCodes.userLoginFirst,
    {
      extensions: { code: -34 },
    }
  );
const userWrongEmailOrPass_Error = async (lang) =>
  new GraphQLError(
    (await translateError("Wrong email or password!", lang)) +
      prefix +
      errorCodes.userWrongCredentials,
    { extensions: { code: -35 } }
  );
const userExpiredAccessJWT_Error = async (lang) =>
  new GraphQLError(
    (await translateError(
      "Expired access token! REDIRECT refreshToken RESOLVER REACT",
      lang
    )) +
      prefix +
      errorCodes.userExpiredAccessJWT,

    {
      extensions: { code: "EXPIRED_ACCESS_TOKEN" },
    }
  );
const userExpiredRefreshJWT_Error = async (lang) =>
  new GraphQLError(
    (await translateError("Expired refresh token! LOGIN AGAIN", lang)) +
      prefix +
      errorCodes.userExpiredRefreshJWT,
    {
      extensions: { code: "EXPIRED_REFRESH_TOKEN" },
    }
  );
const userInvalidAccessJWT_Error = async (lang) =>
  new GraphQLError(
    (await translateError("Invalid access token! LOGIN AGAIN", lang)) +
      prefix +
      errorCodes.userInvalidAccessJWT,
    {
      extensions: { code: "INVALID_ACCESS_TOKEN" },
    }
  );
const userInvalidRefreshJWT_Error = async (lang) =>
  new GraphQLError(
    (await translateError("Invalid refresh token! LOGIN AGAIN", lang)) +
      prefix +
      errorCodes.userInvalidRefreshJWT,
    {
      extensions: { code: "INVALID_REFRESH_TOKEN" },
    }
  );
const userNoAccessJWT_Error = async (lang) =>
  new GraphQLError(
    (await translateError("No access token! LOGIN AGAIN", lang)) +
      prefix +
      errorCodes.userNoAccessJWT,
    {
      extensions: { code: "NO_ACCESS_TOKEN" },
    }
  );
const userNoRefreshJWT_Error = async (lang) =>
  new GraphQLError(
    (await translateError("No refresh token! LOGIN AGAIN", lang)) +
      prefix +
      errorCodes.userNoRefreshJWT,
    {
      extensions: { code: "NO_REFRESH_TOKEN" },
    }
  );
const userBadPermissionUpdating_Error = async (lang, permission) =>
  new GraphQLError(
    (await translateError(
      `Trying to modify a forbidden permission: ${permission}`,
      lang
    )) +
      prefix +
      errorCodes.userInvalidPermissionUpdate,
    {
      extensions: { code: "NO_REFRESH_TOKEN" },
    }
  );

export {
  userNotFound_Error,
  userSoftDeleteFirst_Error,
  userAlreadySoftDeleted_Error,
  userAlreadyValid_Error,
  userNotChanged_Error,
  userEmailAlreadyExist_Error,
  userUsernameAlreadyExist_Error,
  userIsProtected,
  userPWRegex_Error,
  userEmailRegex_Error,
  userShouldReLogin_Error,
  userLoginBlocked_Error,
  userAlreadyBlocked_Error,
  userAlreadyUnblocked_Error,
  userLoginFirst_Error,
  userWrongEmailOrPass_Error,
  userExpiredAccessJWT_Error,
  userExpiredRefreshJWT_Error,
  userInvalidAccessJWT_Error,
  userInvalidRefreshJWT_Error,
  userNoAccessJWT_Error,
  userNoRefreshJWT_Error,
  userBadPermissionUpdating_Error,
};
