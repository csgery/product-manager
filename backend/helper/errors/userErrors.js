import { GraphQLError } from "graphql";
// TODO: string error code instead of int (like: 'INVALID_CREDS')
const userNotFound_Error = () =>
  new GraphQLError("User not found", { extensions: { code: -21 } });
const userSoftDeleteFirst_Error = () =>
  new GraphQLError("Soft delete first!", { extensions: { code: -22 } });
const userAlreadySoftDeleted_Error = () =>
  new GraphQLError("The user's already soft deleted", {
    extensions: { code: -23 },
  });
const userAlreadyValid_Error = () =>
  new GraphQLError("The user's already set to valid", {
    extensions: { code: -24 },
  });
const userNotChanged_Error = () =>
  new GraphQLError("There is no changes, but the log entry has created!", {
    extensions: { code: -25 },
  });
const userEmailAlreadyExist_Error = () =>
  new GraphQLError("This email is already exist!", {
    extensions: { code: -26 },
  });
const userIsProtected = () =>
  new GraphQLError("This user is protected, every manipulation is forbidden!", {
    extensions: { code: -27 },
  });
const userPWRegex_Error = () =>
  new GraphQLError("This password format is invalid!", {
    extensions: { code: -28 },
  });
const userEmailRegex_Error = () =>
  new GraphQLError("This email format is invalid!", {
    extensions: { code: -29 },
  });
const userShouldReLogin_Error = () =>
  new GraphQLError("Please log in again!", { extensions: { code: -30 } });
const userLoginBlocked_Error = () =>
  new GraphQLError(
    "You can no longer login, please contact an administrator!",
    { extensions: { code: -31 } }
  );
const userAlreadyBlocked_Error = () =>
  new GraphQLError("The user's already blocked!", {
    extensions: { code: -32 },
  });
const userAlreadyUnblocked_Error = () =>
  new GraphQLError("The user's already unblocked!", {
    extensions: { code: -33 },
  });
const userLoginFirst_Error = () =>
  new GraphQLError("Please log in first!", { extensions: { code: -34 } });
const userWrongEmailOrPass_Error = () =>
  new GraphQLError("Wrong email or password!", { extensions: { code: -35 } });
const userExpiredAccessJWT_Error = () =>
  new GraphQLError(
    "Expired access token! REDIRECT refreshToken RESOLVER REACT",
    {
      extensions: { code: "EXPIRED_ACCESS_TOKEN" },
    }
  );
const userExpiredRefreshJWT_Error = () =>
  new GraphQLError("Expired refresh token! LOGIN AGAIN", {
    extensions: { code: "EXPIRED_REFRESH_TOKEN" },
  });
const userInvalidAccessJWT_Error = () =>
  new GraphQLError("Invalid access token! LOGIN AGAIN", {
    extensions: { code: "INVALID_ACCESS_TOKEN" },
  });
const userInvalidRefreshJWT_Error = () =>
  new GraphQLError("Invalid refresh token! LOGIN AGAIN", {
    extensions: { code: "INVALID_REFRESH_TOKEN" },
  });
const userNoAccessJWT_Error = () =>
  new GraphQLError("No access token! LOGIN AGAIN", {
    extensions: { code: "NO_ACCESS_TOKEN" },
  });
const userNoRefreshJWT_Error = () =>
  new GraphQLError("No refresh token! LOGIN AGAIN", {
    extensions: { code: "NO_REFRESH_TOKEN" },
  });

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
