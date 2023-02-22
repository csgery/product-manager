import _ from "lodash";
import User from "../../models/user.js";
import UserLog from "../../models/userLog.js";
import { formatDate } from "../../helper/helper.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import {
  userNotFound_Error,
  userNotChanged_Error,
  userAlreadyValid_Error,
  userSoftDeleteFirst_Error,
  userAlreadySoftDeleted_Error,
  userEmailAlreadyExist_Error,
  userIsProtected,
  userLoginBlocked_Error,
  userAlreadyBlocked_Error,
  userAlreadyUnblocked_Error,
  userWrongEmailOrPass_Error,
  userExpiredAccessJWT_Error,
  userExpiredRefreshJWT_Error,
  userInvalidAccessJWT_Error,
  userInvalidRefreshJWT_Error,
  userNoAccessJWT_Error,
  userNoRefreshJWT_Error,
  userUsernameAlreadyExist_Error,
  userBadPermissionUpdating_Error,
  userUserBlocking_Error,
  userUserUnblocking_Error,
} from "../../helper/errors/userErrors.js";
import {
  ENV_TYPES,
  checkEmailRegex,
  checkPWRegex,
  validatePermissions,
  validatePermissionsOLD,
} from "../../helper/helper.js";
import { auth } from "./../permissions.js";
import userLog from "../../models/userLog.js";
/*
  id: ID!
    name: String!
    email: String!
    password: String!
    createdAt: String!
    updatedAt: String!
    valid: Boolean!
    createdBy: String!
    lastModifiedBy: String!

*/

const createAccessToken = (user) => {
  return jwt.sign(
    {
      [process.env.JWT_TOKEN_SCOPE]: {
        permissions: user.permissions,
        CFT: user.CFT + 1,
      },
    },
    process.env.JWT_ACCESSSECRET,
    {
      algorithm: "HS256",
      subject: user.id,
      expiresIn: "1d",
    }
  );
};
const createRefreshToken = (user) => {
  return jwt.sign(
    {
      [process.env.JWT_TOKEN_SCOPE]: {
        permissions: user.permissions,
        CFT: user.CFT + 1,
      },
    },
    process.env.JWT_REFRESHSECRET,
    {
      algorithm: "HS256",
      subject: user.id,
      expiresIn: "7d",
    }
  );
};

const revokeTokens = async (userId) => {
  // is it like a logout mutation?
  if (!userId) {
    return false;
  }

  const user = await User.findById(userId);
  if (!user) {
    return false;
  }
  user.CFT++;
  await user.save();

  return true;
};

export default {
  Query: {
    validUsers: async () => {
      const users = await User.find({ valid: true });
      // this is same -> migrate to a function
      return users.map((user) => {
        return {
          ...user._doc,
          id: user.id,
          createdAt: formatDate(user.createdAt),
          updatedAt: formatDate(user.updatedAt),
        };
      });
    },
    deletedUsers: async () => {
      try {
        const users = await User.find({ valid: false });
        // TODO: this is same -> migrate to a function
        return users.map((user) => {
          return {
            ...user._doc,
            id: user.id,
            createdAt: formatDate(user.createdAt),
            updatedAt: formatDate(user.updatedAt),
          };
        });
      } catch (err) {
        throw err;
      }
    },
    user: async (parent, { id }, { req }) => {
      const lang = req.headers.language || "en";
      const user = await User.findById(id);
      if (!user) {
        throw userNotFound_Error(lang);
      }
      // this is same -> migrate to a function
      return {
        ...user._doc,
        id: user.id,
        createdAt: formatDate(user.createdAt),
        updatedAt: formatDate(user.updatedAt),
      };
    },
    viewer: async (parent, args, { user: userCtx, req }) => {
      const lang = req.headers.language || "en";
      const user = await User.findById(userCtx.sub);
      if (!user) {
        throw userNotFound_Error(lang);
      }
      return user;
    },
  },
  Mutation: {
    // TODO: Only in development and first initialise in production
    createAdmin: async () => {
      if (process.env.NODE_ENV !== ENV_TYPES.development) {
        throw new Error("This method is forbidden!");
      }
      const user = new User({
        username: process.env.INIT_USER_USERNAME,
        email: process.env.INIT_USER_EMAIL,
        password: await bcrypt.hash(process.env.INIT_USER_PASSWORD, 12),
        createdBy: process.env.INIT_ROOTNAME,
        updatedBy: "-",
        valid: true,
      });
      // grant all permissions
      for (const [actualKey, actualValue] of Object.entries(auth.PERMS)) {
        user.permissions.push(actualValue);
      }
      await user.save();
      const userLog = new UserLog({
        userId: user.id,
        newUsername: user.username,
        newEmail: user.email,
        newCFT: 0,
        createdBy: process.env.INIT_ROOTNAME,
        actionType: "initialise-admin-user",
      });
      await userLog.save();
      return user;
    },
    checkPermValidationTime: (parent, { count }) => {
      if (process.env.NODE_ENV !== ENV_TYPES.development) {
        throw new Error("This method is forbidden!");
      }
      if (typeof count !== "number") {
        throw new Error("The given count is not a number!");
      }
      if (count < 1 || count > 10000) {
        throw new Error("The given count is less than 1 or larger than 10000!");
      }
      const perms = [];
      for (const [elemKey, elemValue] of Object.entries(auth.PERMS)) {
        perms.push(elemValue);
      }
      // to test the time of get all entries dependencies
      let newAVG;
      let oldAVG;
      let validatedPerms;
      let validatedPermsOLD;
      //const count = 2;
      for (let i = 0; i < count; i++) {
        const startTime = performance.now();
        validatedPerms = validatePermissions(perms);
        const endTime = performance.now();
        const elapsedTime = endTime - startTime;
        newAVG = +elapsedTime;

        const startTimeOLD = performance.now();
        validatedPermsOLD = validatePermissionsOLD(perms);
        const endTimeOLD = performance.now();
        const elapsedTimeOLD = endTimeOLD - startTimeOLD;
        oldAVG = +elapsedTimeOLD;
      }
      newAVG = newAVG / count;
      oldAVG = oldAVG / count;
      return [
        `With IF: Elapsed AVG time of ${count} tries: ${newAVG * 1000} ms`,
        `With For-loop: Elapsed AVG time of ${count} tries: ${
          oldAVG * 1000
        } ms`,
        `Length of validated perms with IF: ${validatedPerms.length}`,
        `Length of validated perms with for: ${validatedPermsOLD.length}`,
        JSON.stringify(validatedPerms),
        JSON.stringify(validatedPermsOLD),
      ];
    },
    createUser: async (
      parent,
      { username, email, password, permissions, image },
      { user: userCtx, req }
    ) => {
      try {
        const lang = req.headers.language || "en";
        checkPWRegex(password, lang);
        checkEmailRegex(email, lang);

        const existedUsername = await User.findOne({ username });
        if (existedUsername) {
          throw userUsernameAlreadyExist_Error(lang);
        }

        const existedEmail = await User.findOne({ email });
        if (existedEmail) {
          throw userEmailAlreadyExist_Error(lang);
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        let validatedPermissions = [];
        if (permissions?.length > 0) {
          validatedPermissions = validatePermissions(permissions);
        }

        const user = new User({
          username,
          email,
          password: hashedPassword,
          createdBy: userCtx.sub,
          updatedBy: "-",
          permissions:
            validatedPermissions?.length > 0
              ? validatedPermissions
              : [auth.PERMS.readOwn_user],
          image,
          valid: true,
        });

        const userResult = await user.save();

        const userLog = new UserLog({
          userId: userResult.id,
          newUsername: username,
          newEmail: email,
          newImage: image,
          newValid: true,
          newCFT: 0,
          createdBy: userCtx.username,
          actionType: "create",
        });
        await userLog.save();

        return userResult;
      } catch (err) {
        throw err;
      }
    },

    updateUser: async (
      parent,
      { id, username, email, image },
      { user: userCtx, req }
    ) => {
      try {
        const lang = req.headers.language || "en";
        checkEmailRegex(email);
        let user = await User.findById(id);
        if (!user) {
          throw userNotFound_Error(lang);
        }
        const fieldsToUpdate = {};
        const fieldsToLog = {};

        // add the modifier user
        fieldsToUpdate.updatedBy = userCtx.sub;

        let changes = false;

        // if there is changes
        if (email && user.email !== email) {
          const existedEmail = await User.findOne({ email });

          if (existedEmail) {
            // log this incident
            const userLog = new UserLog({
              userId: user.id,
              createdBy: userCtx.sub,
              actionType: "update",
              message: "unsuccessful-email-update",
            });
            // create the log entry
            await userLog.save();
            throw userEmailAlreadyExist_Error(lang);
          }

          changes = true;
          // add the changed field to fieldsToUpdate
          fieldsToUpdate.email = email;
          // add the old and new values for logging
          fieldsToLog.oldEmail = user.email;
          fieldsToLog.newEmail = email;
        }

        // if there is no new values in the log that means someone tries to update the user without changes
        const userLog = new UserLog({
          ...fieldsToLog,
          userId: user.id,
          createdBy: userCtx.sub,
          actionType: "update",
          // if there is no changes than message
        });
        if (_.isEmpty(fieldsToLog)) {
          userLog.message = "unsuccessful-empty-update";
        }

        // create the log entry
        await userLog.save();

        // if there is changes, update
        if (changes) {
          await user.update(fieldsToUpdate);

          return user.id;
        }

        // if there is no changes
        throw userNotChanged_Error(lang);
      } catch (err) {
        throw err;
      }
    },

    updatePermission: async (
      parent,
      // { id, permissions: newPermissions },
      { arrayString },
      { user: userCtx, req }
    ) => {
      //console.log("userCtx", userCtx);

      const inputArray = arrayString.map((item) => JSON.parse(item));
      const lang = req.headers.language || "en";
      const reqUserPermissions =
        userCtx[process.env.JWT_TOKEN_SCOPE].permissions;
      //console.log("reqUserPermissions", reqUserPermissions);
      //console.log("reqUserPermissions", reqUserPermissions);

      for (const userToEdit of inputArray) {
        const originalUser = await User.findById(userToEdit.id);
        if (!originalUser) {
          throw userNotFound_Error(lang);
        }
        //console.log("userCtx", userCtx);

        // check if there is any forbidden permission
        // TODO: implement try cache instead of this.....
        let isError = false;
        let errorDataForLog = {
          message: "",
          perm: "",
          securityLevel: "severe_frontend-modifying",
        };
        console.log("userToEdit.id", userToEdit.id);
        console.log("userCtx.sub", userCtx.sub);
        // if try update ourself
        if (userToEdit.id === userCtx.sub) {
          isError = true;
          errorDataForLog.message = `invalid-permission-update: self-updating`;
          errorDataForLog.perm = "self-update";
        }
        // revoke readOwn_user
        else if (!userToEdit.permissions.includes(auth.PERMS.readOwn_user)) {
          isError = true;
          errorDataForLog.message = `invalid-permission-revoke: ${auth.PERMS.readOwn_user}`;
          errorDataForLog.perm = auth.PERMS.readOwn_user;
        }
        // grant owner perm
        else if (
          userToEdit.permissions.includes(auth.PERMS.owner) &&
          !originalUser.permissions.includes(auth.PERMS.owner)
        ) {
          isError = true;
          errorDataForLog.message = `invalid-permission-provide: ${auth.PERMS.owner}`;
          errorDataForLog.perm = auth.PERMS.owner;
        }
        // revoke owner perm
        else if (
          !userToEdit.permissions.includes(auth.PERMS.owner) &&
          originalUser.permissions.includes(auth.PERMS.owner)
        ) {
          isError = true;
          errorDataForLog.message = `invalid-permission-revoke: ${auth.PERMS.owner}`;
          errorDataForLog.perm = auth.PERMS.owner;
        }
        // revoke protected if reqUser not owner (original is protected and edited is not)
        else if (
          originalUser.permissions.includes(auth.PERMS.protected) &&
          !userToEdit.permissions.includes(auth.PERMS.protected) &&
          !reqUserPermissions.includes(auth.PERMS.owner)
        ) {
          isError = true;
          errorDataForLog.message = `invalid-permission-revoke: ${auth.PERMS.protected}`;
          errorDataForLog.perm = auth.PERMS.protected;
        }
        // grant protected if reqUser not owner
        else if (
          userToEdit.permissions.includes(auth.PERMS.protected) &&
          !reqUserPermissions.includes(auth.PERMS.owner)
        ) {
          isError = true;
          errorDataForLog.message = `invalid-permission-provide: ${auth.PERMS.protected}`;
          errorDataForLog.perm = auth.PERMS.protected;
        }
        // revoke protected if original owner
        else if (
          !userToEdit.permissions.includes(auth.PERMS.protected) &&
          originalUser.permissions.includes(auth.PERMS.owner)
        ) {
          isError = true;
          errorDataForLog.message = `invalid-permission-revoke: ${auth.PERMS.protected}`;
          errorDataForLog.perm = auth.PERMS.protected;
        }

        if (isError) {
          const userLog = new UserLog({
            userId: originalUser.id,
            createdBy: userCtx.sub,
            actionType: "update-permissions",
            message: errorDataForLog.message,
            securityLevel: errorDataForLog.securityLevel,
          });
          //console.log(userLog);
          await userLog.save();
          throw userBadPermissionUpdating_Error(lang, errorDataForLog.perm);
        }

        let validatedPermissions = [];
        if (userToEdit.permissions?.length > 0) {
          validatedPermissions = validatePermissions(userToEdit.permissions);
        }

        if (
          validatedPermissions?.length < 1 ||
          JSON.stringify(originalUser.permissions) ===
            JSON.stringify(validatedPermissions)
        ) {
          const userLog = new UserLog({
            userId: originalUser.id,
            createdBy: userCtx.sub,
            actionType: "update-permissions",
            message:
              validatedPermissions?.length < 1
                ? "unsuccessful-empty-update"
                : "unsuccessful-update-samePermissions",
            securityLevel: "severe_frontend-modifying",
          });
          console.log(userLog);
          await userLog.save();
          throw userNotChanged_Error(lang);
        }

        const fieldsToLog = {};
        fieldsToLog.oldPermissions = originalUser.permissions;
        fieldsToLog.newPermissions = validatedPermissions;
        fieldsToLog.oldCFT = originalUser.CFT;
        fieldsToLog.newCFT = originalUser.CFT + 1;
        const userLog = new UserLog({
          ...fieldsToLog,
          userId: originalUser.id,
          createdBy: userCtx.sub,
          actionType: "update-permissions",
        });
        await userLog.save();
        //user.permissions = newPermissions;
        await originalUser.update({
          CFT: originalUser.CFT + 1,
          permissions: validatedPermissions,
          shouldUserReLogin: true,
          updatedBy: userCtx.sub,
        });
        //return originalUser.id;
      }
      return "ok";
    },

    deleteUser: async (parent, { id }, { user: userCtx, req }) => {
      try {
        const lang = req.headers.language || "en";
        const user = await User.findById(id);
        const reqUserPermissions =
          userCtx[process.env.JWT_TOKEN_SCOPE].permissions;
        console.log("reqUserPermissions", reqUserPermissions);
        if (!user) {
          throw userNotFound_Error(lang);
        }
        if (
          user.permissions.includes(auth.PERMS.owner) ||
          (user.permissions.includes(auth.PERMS.protected) &&
            !reqUserPermissions.includes(auth.PERMS.owner))
        ) {
          const userLog = new UserLog({
            userId: user.id,
            oldUsername: user.username,
            createdBy: userCtx.sub,
            actionType: "softdelete",
            message: "user-protection-violation",
            securityLevel: "severe_frontend-modifying",
          });
          await userLog.save();
          throw userIsProtected(lang);
        }

        if (!user.valid) {
          throw userAlreadySoftDeleted_Error(lang);
        }
        await user.update({
          valid: false,
          shouldUserReLogin: true,
          CFT: user.CFT + 1,
          createdBy: userCtx.sub,
        });
        const userLog = new UserLog({
          userId: user.id,
          oldValid: user.valid,
          newValid: !user.valid,
          createdBy: userCtx.sub,
          actionType: "softdelete",
        });
        await userLog.save();
        return user.id;
      } catch (err) {
        throw err;
      }
    },
    restoreUser: async (parent, { id }, { user: userCtx, req }) => {
      try {
        const lang = req.headers.language || "en";
        const user = await User.findById(id);
        if (!user) {
          throw userNotFound_Error(lang);
        }
        if (user.valid) {
          throw userAlreadyValid_Error(lang);
        }
        await user.update({ valid: true, createdBy: userCtx.sub });
        const userLog = new UserLog({
          userId: user.id,
          oldValid: user.valid,
          newValid: !user.valid,
          createdBy: userCtx.sub,
          actionType: "restore-softdelete",
        });
        await userLog.save();
        return user.id;
      } catch (err) {
        throw err;
      }
    },
    removeUser: async (parent, { id }, { user: userCtx, req }) => {
      try {
        const lang = req.headers.language || "en";
        const user = await User.findById(id);
        if (!user) {
          throw userNotFound_Error(lang);
        }
        if (user.permissions.includes(auth.PERMS.protected)) {
          const userLog = new UserLog({
            userId: user.id,
            oldUsername: user.username,
            createdBy: userCtx.sub,
            actionType: "delete",
            message: "user-protection-violation",
          });
          await userLog.save();
          throw userIsProtected();
        }
        if (user.valid) {
          throw userSoftDeleteFirst_Error(lang);
        }
        await user.delete();
        const userLog = new UserLog({
          userId: user.id,
          oldUsername: user.username,
          createdBy: userCtx.sub,
          actionType: "delete",
        });
        await userLog.save();
        return user.id;
      } catch (err) {
        throw err;
      }
    },

    changePassword: async (
      parent,
      { id, currentPassword, newPassword },
      { user: userCtx, req }
    ) => {
      const lang = req.headers.language || "en";
      const user = await User.findOne({ _id: id, valid: true });
      if (!user) {
        throw userNotFound_Error(lang);
      }
      checkPWRegex(newPassword);
      const isPWCorrect = await bcrypt.compare(currentPassword, user.password);
      if (!isPWCorrect) {
        if (process.env.NODE_ENV === ENV_TYPES.development) {
          throw new Error(
            "PW is incorrect BUT THIS MESSAGE ONLY FOR DEVELOPMENT!"
          );
        } else {
          throw userWrongEmailOrPass_Error(lang);
        }
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await user.update({ password: hashedPassword });
      return user.id;
    },

    blockUser: async (parent, { id }, { user: userCtx, req }) => {
      const lang = req.headers.language || "en";
      const user = await User.findById(id);
      if (!user) {
        throw userNotFound_Error(lang);
      }
      if (!user.canLogin) {
        throw userAlreadyBlocked_Error(lang);
      }
      const reqUserPermissions =
        userCtx[process.env.JWT_TOKEN_SCOPE].permissions;

      // check if there is any forbidden situation
      // TODO: implement try cache instead of this.....
      let isError = false;
      let errorDataForLog = {
        message: "",
        securityLevel: "severe_frontend-modifying",
      };
      if (!reqUserPermissions.includes(auth.PERMS.updateUser_permissions)) {
        isError = true;
        errorDataForLog.message =
          "try to block without required permission: " +
          auth.PERMS.updateUser_permissions;
      } else if (user.permissions.includes(auth.PERMS.owner)) {
        isError = true;
        errorDataForLog.message = "try to block owner user";
      } else if (
        user.permissions.includes(auth.PERMS.protected) &&
        !reqUserPermissions.includes(auth.PERMS.owner)
      ) {
        isError = true;
        errorDataForLog.message =
          "try to block protected user without owner right";
      }
      if (isError) {
        const userLog = new UserLog({
          userId: originalUser.id,
          createdBy: userCtx.sub,
          actionType: "user-block-login",
          message: errorDataForLog.message,
          securityLevel: errorDataForLog.securityLevel,
        });
        //console.log(userLog);
        await userLog.save();
        throw userUserBlocking_Error(lang);
      }

      await user.update({
        shouldUserReLogin: true,
        canLogin: false,
        // in order to trigger the re-login error message comment out CFT+1
        //CFT: user.CFT + 1,
      });

      const userLog = new UserLog({
        userId: user.id,
        oldShouldUserReLogin: user.shouldUserReLogin,
        newShouldUserReLogin: true,
        oldCanLogin: user.canLogin,
        newCanLogin: false,
        createdBy: userCtx.sub,
        actionType: "block-user",
      });
      await userLog.save();
      return user.id;
    },

    unblockUser: async (parent, { id }, { user: userCtx, req }) => {
      const lang = req.headers.language || "en";
      const user = await User.findById(id);
      if (!user) {
        throw userNotFound_Error(lang);
      }
      if (user.canLogin) {
        throw userAlreadyUnblocked_Error(lang);
      }

      const reqUserPermissions =
        userCtx[process.env.JWT_TOKEN_SCOPE].permissions;

      // check if there is any forbidden situation
      // TODO: implement try cache instead of this.....
      let isError = false;
      let errorDataForLog = {
        message: "",
        securityLevel: "severe_frontend-modifying",
      };
      if (!reqUserPermissions.includes(auth.PERMS.updateUser_permissions)) {
        isError = true;
        errorDataForLog.message =
          "try to unblock without required permission: " +
          auth.PERMS.updateUser_permissions;
      } else if (user.permissions.includes(auth.PERMS.owner)) {
        isError = true;
        errorDataForLog.message = "try to unblock owner user";
      } else if (
        user.permissions.includes(auth.PERMS.protected) &&
        !reqUserPermissions.includes(auth.PERMS.owner)
      ) {
        isError = true;
        errorDataForLog.message =
          "try to unblock protected user without owner right";
      }
      if (isError) {
        const userLog = new UserLog({
          userId: originalUser.id,
          createdBy: userCtx.sub,
          actionType: "user-block-login",
          message: errorDataForLog.message,
          securityLevel: errorDataForLog.securityLevel,
        });
        //console.log(userLog);
        await userLog.save();
        throw userUserUnblocking_Error(lang);
      }

      await user.update({ canLogin: true });

      const userLog = new UserLog({
        userId: user.id,
        oldCanLogin: user.canLogin,
        newCanLogin: true,
        createdBy: userCtx.sub,
        actionType: "unblock-user",
      });
      await userLog.save();
      return user.id;
    },

    login: async (parent, { email, password }, { req }) => {
      // console.log("in login resolver");
      // console.log("headers:", req?.headers);
      const lang = req.headers.language || "en";
      const user = await User.findOne({ email: email, valid: true });
      if (!user) {
        throw userNotFound_Error(lang);
      }
      if (!user.canLogin) {
        throw userLoginBlocked_Error(lang);
      }
      const isPWCorrect = await bcrypt.compare(password, user.password);
      if (!isPWCorrect) {
        if (process.env.NODE_ENV === ENV_TYPES.development) {
          throw new Error(
            "PW is incorrect BUT THIS MESSAGE ONLY FOR DEVELOPMENT!"
          );
        } else {
          throw userWrongEmailOrPass_Error(lang);
        }
      }

      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);
      await user.update({
        shouldUserReLogin: false,
        CFT: user.CFT + 1,
      });
      return [accessToken, refreshToken];
    },
    invalidateTokens: async (_, __, { user: userCtx, req }) => {
      // is it like a logout mutation?
      if (!userCtx || !userCtx.sub) {
        return false;
      }

      return await revokeTokens(userCtx.sub);
    },

    refreshToken: async (parent, args, { req }) => {
      // TODO: refresh token, Cookie management? -> Client side cookies
      console.log(req);
      const lang = req.headers.language || "en";
      let refreshToken = req.headers.refreshtoken;
      if (!refreshToken) {
        throw userNoRefreshJWT_Error(lang);
      }

      let verifiedTokenData = null;
      try {
        verifiedTokenData = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESHSECRET
        );
      } catch (err) {
        // if the refresh token has expired
        if (err.message === "jwt expired") {
          console.log("refresh token expired");
          // return the user context and check in the permissions file
          throw userExpiredRefreshJWT_Error(lang);
        }
        if (err.message === "jwt must be provided") {
          console.log("there is no refresh token or wrong format");
          console.log(refreshToken);
          return;
        }
        console.log(err);
        throw userInvalidRefreshJWT_Error(lang);
      }

      const user = await User.findById(verifiedTokenData.sub);
      if (!user) {
        throw new userNotFound_Error(lang);
      }

      if (user.CFT !== verifiedTokenData[process.env.JWT_TOKEN_SCOPE].CFT) {
        throw userExpiredRefreshJWT_Error(lang);
      }

      await revokeTokens(user.id);

      const accessToken = createAccessToken(user);
      refreshToken = createRefreshToken(user);

      return [accessToken, refreshToken];
      `
      https://www.geeksforgeeks.org/jwt-authentication-with-refresh-tokens/

      https://community.apollographql.com/t/refreshing-access-and-refresh-tokens-via-apollo-in-react/1440

      https://community.apollographql.com/t/allow-cookies-to-be-sent-alongside-request/920/12

      https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials

      https://github.com/apollographql/apollo-server/issues/5775#issuecomment-936896592
      `;
    },
  },
};
