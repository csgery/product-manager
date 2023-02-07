import Dict from "../models/dict.js";
import { PERMS, PERMS_DEPENDENCIES } from "../graphql/permissions.js";
import {
  userPWRegex_Error,
  userEmailRegex_Error,
} from "./errors/userErrors.js";
// import { User } from "../models/user.js";
const formatDate = (date) => new Date(date).toISOString();

// TODO: later maybe...
const createLog = async (LogModel, fieldsToLog) => {
  const log = new LogModel({ fieldsToLog });
  return await log.save();
};
//
// Jenkins "One-At-A-Time" hash function, more info:
// https://en.wikipedia.org/wiki/Jenkins_hash_function
// https://gist.github.com/atdt/2330641/revisions
//
const hashString = (key) => {
  var hash = 0,
    i = key.length;

  while (i--) {
    hash += key.charCodeAt(i);
    hash += hash << 10;
    hash ^= hash >> 6;
  }
  hash += hash << 3;
  hash ^= hash >> 11;
  hash += hash << 15;
  return hash;
};

// const getUser = async (id) => {
//   return await User.find(id);
// };

// const formatProductUserData = async (id) => {
//   const user = await getUser();
//   return [user.id, user.username];
// };

/**
 * Throws an error if not correct for the PW Regex
 * @param {String} password
 */
const checkPWRegex = (password) => {
  // regex: any utf8 character AND at least 1 number AND at least 1 spec. char.
  const pwRegex =
    /^(?=.*?[\u0000-\u007F])(?=.*?[0-9])(?=.*?[#?!@$%^&*-+]).{8,}$/;
  if (!pwRegex.test(password)) {
    throw userPWRegex_Error();
  }
};

/**
 * Throws an error if not correct for the Email Regex
 * @param {String} email
 */
const checkEmailRegex = (email) => {
  // regex: any utf8 character AND at least 1 number AND at least 1 spec. char.
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    throw userEmailRegex_Error();
  }
};

/**
 *  Validate the given permissions array and return back the validated permissions array with its dependencies
 * @param {[String]} permissions [string]
 * @returns {[String]} [string] validated permissions with dependencies
 */
const validatePermissions = (permissions) => {
  // Check if the given permissions is in the PERMS obj
  const validatedPermissions = permissions.filter(
    (permission) =>
      Object.values(PERMS).includes(permission) &&
      permission !== PERMS.protected
    // because only the main super admin can be protected (it will be created in the project's init. state)
  );
  // Get the valid perms dependencies
  let dependencies = [];
  const getDependencies = (value) => {
    //
    if (
      !dependencies.includes(value) &&
      Object.keys(PERMS_DEPENDENCIES).includes(value)
    ) {
      const depKey = value;
      const depValue = PERMS_DEPENDENCIES[depKey];
      dependencies.push(depKey);
      depValue.map((actual) => getDependencies(actual));
    }
    return false;
  };
  // Entry point of the get dependencies
  // Loop through the validated pemrs and call the function each element recursively
  validatedPermissions.map((validatedPerm) => getDependencies(validatedPerm));

  return dependencies;
};

const validatePermissionsOLD = (permissions) => {
  // Check if the given permissions is in the PERMS obj
  const validatedPermissions = permissions.filter(
    (permission) =>
      Object.values(PERMS).includes(permission) &&
      permission !== PERMS.protected
  );
  // Get the valid perms dependencies
  let dependencies = [];
  const getDependencies = (value) => {
    // Loop through the PERMS_DEPENDENCIES object
    for (const [depKey, depValue] of Object.entries(PERMS_DEPENDENCIES)) {
      // if the actual dep is equal the actual tested value AND that value is not in the output dep array
      if (depKey === value && !dependencies.includes(value)) {
        // Add to the output array the actual dep value
        dependencies.push(value);
        // and loop through that actual value's dependencies too and each dep call this function
        depValue.map((actual) => getDependencies(actual));
      }
    }
  };
  // Entry point of the get dependencies
  // Loop through the validated pemrs and call the function each element recursively
  validatedPermissions.map((validatedPerm) => getDependencies(validatedPerm));

  return dependencies;
};

// const getErrorText = async () => {};
const getErrorText = async (lang, hash) => {
  if (!hash) {
    throw new Error("No error message hash");
  }
  if (!lang) {
    throw new Error("No lang");
  }
  const translatedMessage = await Dict.findOne({ hash });
  return translatedMessage?.dicts[lang];
};

const createErrorText = async (errorMessage, lang, hash) => {
  const entry = await Dict.findOne({ hash });
  if (entry && entry.dicts[lang]) {
    return entry.dicts[lang] + "IT IS BAD!!!!";
  }
  let newEntry = {};
  if (!entry) {
    newEntry = new Dict({
      hash: hash,
      dicts: {
        en: errorMessage,
        [lang]: `${lang}_${errorMessage}`,
      },
    });
    await newEntry.save();
    return newEntry.dicts[lang];
  } else if (!entry.dicts[lang]) {
    await entry.update(
      {
        dicts: {
          ...entry.dicts,
          [lang]: `${lang}_${errorMessage}`,
        },
      },
      { returnDocument: "after", new: true, returnOriginal: false }
    );
    return `${lang}_${errorMessage}`;
  }
};

const translateError = async (errorMessage, lang) => {
  const hash = hashString(errorMessage);
  let result = await getErrorText(lang, hash);
  if (!result) {
    result = await createErrorText(errorMessage, lang, hash);
  }
  return result;
};

const errorCodePrefix = "$";

const userErrorCodes = {
  userNotFound: "USER_NOT-FOUND",
  userDeleteFirst: "USER_DELETE-FIRST",
  userAlreadyDeleted: "USER_ALREADY-DELETED",
  userAlreadyRestored: "USER_ALREADY-RESTORED",
  userEmptyUpdate: "USER_EMPTY-UPDATE",
  userEmailExists: "USER_EXISTED-EMAIL",
  userProtectionViolation: "USER_PROTECTION-VIOLATION",
  userInvalidPasswordFormat: "USER_INVALID-PASSWORDFORMAT",
  userInvalidEmailFormat: "USER_INVALID-EMAILFORMAT",
  userShouldReLogin: "USER_SHOULD-RELOGIN",
  userLoginBlocked: "USER_LOGIN-BLOCKED",
  userAlreadyBlocked: "USER_ALREADY-BLOCKED",
  userAlreadyUnBlocked: "USER_ALREADY-UNBLOCKED",
  userLoginFirst: "USER_LOGIN-FIRST",
  userWrongCredentials: "USER_WRONG-CREDENTIALS",
  userExpiredAccessJWT: "USER_EXPIRED-ACCESSJWT",
  userExpiredRefreshJWT: "USER_EXPIRED-REFRESHJWT",
  userInvalidAccessJWT: "USER_INVALID-ACCESSJWT",
  userInvalidRefreshJWT: "USER_INVALID-REFRESHJWT",
  userNoAccessJWT: "USER_NO-ACCESSJWT",
  userNoRefreshJWT: "USER_NO-REFRESHJWT",
};

const productErrorCodes = {
  productNotFound: "PRODUCT_NOT-FOUND",
  productDeleteFirst: "PRODUCT_DELETE-FIRST",
  productAlreadyDeleted: "PRODUCT_ALREADY-DELETED",
  productAlreadyRestored: "PRODUCT_ALREADY-RESTORED",
  productEmptyUpdate: "PRODUCT_EMPTY-UPDATE",
  productExistedShortID: "PRODUCT_EXISTED-SHORTID",
};

export {
  formatDate,
  checkEmailRegex,
  checkPWRegex,
  validatePermissions,
  validatePermissionsOLD,
  hashString,
  translateError,
  userErrorCodes,
  productErrorCodes,
  errorCodePrefix,
};
