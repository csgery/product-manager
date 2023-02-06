import { GraphQLError } from "graphql";
import { translateError, userErrorCodes as errorCodes } from "../helper.js";

// TODO: string error code instead of int (like: 'INVALID_CREDS')
const userNotFound_Error = async () =>
  new GraphQLError(
    (await translateError("User not found!", lang)) + errorCodes.userNotFound,
    {
      extensions: { code: -21 },
    }
  );
const userSoftDeleteFirst_Error = async () =>
  new GraphQLError(
    (await translateError("Soft delete first!", lang)) +
      errorCodes.userDeleteFirst,
    {
      extensions: { code: -22 },
    }
  );
const userAlreadySoftDeleted_Error = async () =>
  new GraphQLError(
    (await translateError("The user's already soft deleted!", lang)) +
      errorCodes.userAlreadyDeleted,
    {
      extensions: { code: -23 },
    }
  );
const userAlreadyValid_Error = async () =>
  new GraphQLError(
    (await translateError("The user's already set to valid!", lang)) +
      errorCodes.userAlreadyRestored,
    {
      extensions: { code: -24 },
    }
  );
const userNotChanged_Error = async () =>
  new GraphQLError(
    (await translateError(
      "There is no changes, but the log entry has created!",
      lang
    )) + errorCodes.userEmptyUpdate,
    {
      extensions: { code: -25 },
    }
  );
const userEmailAlreadyExist_Error = async () =>
  new GraphQLError(
    (await translateError("This email is already exist!", lang)) +
      errorCodes.userEmailExists,
    {
      extensions: { code: -26 },
    }
  );
const userIsProtected = async () =>
  new GraphQLError(
    (await translateError(
      "This user is protected, every manipulation is forbidden!",
      lang
    )) + errorCodes.userProtectionViolation,
    {
      extensions: { code: -27 },
    }
  );
const userPWRegex_Error = async () =>
  new GraphQLError(
    (await translateError("This password format is invalid!", lang)) +
      errorCodes.userInvalidPasswordFormat,
    {
      extensions: { code: -28 },
    }
  );
const userEmailRegex_Error = async () =>
  new GraphQLError(
    (await translateError("This email format is invalid!", lang)) +
      errorCodes.userInvalidEmailFormat,
    {
      extensions: { code: -29 },
    }
  );
const userShouldReLogin_Error = async () =>
  new GraphQLError(
    (await translateError("Please log in again!", lang)) +
      errorCodes.userShouldReLogin,
    {
      extensions: { code: -30 },
    }
  );
const userLoginBlocked_Error = async () =>
  new GraphQLError(
    (await translateError(
      "You can no longer login, please contact an administrator!",
      lang
    )) + errorCodes.userLoginBlocked,
    { extensions: { code: -31 } }
  );
const userAlreadyBlocked_Error = async () =>
  new GraphQLError(
    (await translateError("The user's already blocked!", lang)) +
      errorCodes.userAlreadyBlocked,
    {
      extensions: { code: -32 },
    }
  );
const userAlreadyUnblocked_Error = async () =>
  new GraphQLError(
    (await translateError("The user's already unblocked!", lang)) +
      errorCodes.userAlreadyUnBlocked,
    {
      extensions: { code: -33 },
    }
  );
const userLoginFirst_Error = async () =>
  new GraphQLError(
    (await translateError("Please log in first!", lang)) +
      errorCodes.userLoginFirst,
    {
      extensions: { code: -34 },
    }
  );
const userWrongEmailOrPass_Error = async () =>
  new GraphQLError(
    (await translateError("Wrong email or password!", lang)) +
      errorCodes.userWrongCredentials,
    { extensions: { code: -35 } }
  );
const userExpiredAccessJWT_Error = async () =>
  new GraphQLError(
    (await translateError(
      "Expired access token! REDIRECT refreshToken RESOLVER REACT",
      lang
    )) + errorCodes.userExpiredAccessJWT,

    {
      extensions: { code: "EXPIRED_ACCESS_TOKEN" },
    }
  );
const userExpiredRefreshJWT_Error = async () =>
  new GraphQLError(
    (await translateError("Expired refresh token! LOGIN AGAIN", lang)) +
      errorCodes.userExpiredRefreshJWT,
    {
      extensions: { code: "EXPIRED_REFRESH_TOKEN" },
    }
  );
const userInvalidAccessJWT_Error = async () =>
  new GraphQLError(
    (await translateError("Invalid access token! LOGIN AGAIN", lang)) +
      errorCodes.userInvalidAccessJWT,
    {
      extensions: { code: "INVALID_ACCESS_TOKEN" },
    }
  );
const userInvalidRefreshJWT_Error = async () =>
  new GraphQLError(
    (await translateError("Invalid refresh token! LOGIN AGAIN", lang)) +
      errorCodes.userInvalidRefreshJWT,
    {
      extensions: { code: "INVALID_REFRESH_TOKEN" },
    }
  );
const userNoAccessJWT_Error = async () =>
  new GraphQLError(
    (await translateError("No access token! LOGIN AGAIN", lang)) +
      errorCodes.userNoAccessJWT,
    {
      extensions: { code: "NO_ACCESS_TOKEN" },
    }
  );
const userNoRefreshJWT_Error = async () =>
  new GraphQLError(
    (await translateError("No refresh token! LOGIN AGAIN", lang)) +
      errorCodes.userNoRefreshJWT,
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
};
