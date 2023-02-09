import jwt from "jwt-decode";
import { GET_DICT, GET_MOREDICT } from "../queries/dictQueries";
import { CREATE_DICT, CREATE_MOREDICT } from "../mutations/dictMutations";
import { print } from "graphql/language/printer";
import { Store } from "react-notifications-component";

// const isSet = (permission) => {
//   return localStorage.getItem("permissions").includes(permission);
// };

const auth = {
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
  },
  isAuthenticated: () => {
    const tokenScope = import.meta.env.VITE_BACKEND_URI;
    try {
      const tokenData = auth.getTokenData();
      if (!tokenData) {
        //console.log("tokenData", tokenData);
        return false;
      }
      // if the token scope different or not exists
      if (!tokenData[tokenScope]) {
        const error = new Error();
        error.name = "INVALID TOKEN SCOPE";
        throw error;
      }
      return true;
    } catch (error) {
      return false;
    }
  },
  getUserId: () => {
    return jwt(localStorage.getItem("accesstoken")).sub;
  },
  isSet: (permission) => {
    const tokenScope = import.meta.env.VITE_BACKEND_URI;
    const tokenData = auth.getTokenData();
    if (!tokenData) {
      return false;
    }
    const permissions = tokenData[tokenScope].permissions;
    console.log("permissions", permissions);

    if (!permission) return false;
    return permissions.includes(permission);
  },
  isReadingOwnUser: (userIdToView) => {
    if (!userIdToView) {
      throw new Error("userIdToView is needed but given parameter is null!");
    }
    return auth.getUserId() === userIdToView;
  },
  checkTokenIsValid: () => {
    const accessToken = localStorage.getItem("accesstoken");
    if (!accessToken) return false;
    try {
      jwt(accessToken);
      return true;
    } catch (error) {
      if (Object.getPrototypeOf(error).name === "InvalidTokenError") {
        console.log("INVALID TOKEN ERROR");
      } else {
        console.log(error);
      }
      return false;
    }
  },
  getTokenData: () => {
    if (!auth.checkTokenIsValid()) {
      return null;
    }
    return jwt(localStorage.getItem("accesstoken"));
  },
  // getUserPermissions: () => {
  //   return jwt(localStorage.getItem("accesstoken")) backend.permissions;
  // },
};
const PERMS_DEPENDENCIES = {
  // users
  [auth.PERMS.readOwn_user]: [],
  [auth.PERMS.protected]: [],
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

// ADD PERMS DEPS (I NEED TO A REMOVE PERM DEPS in frontend to remove elements which dont have perms that dependents)
/**
 *  Validate the given permissions array and return back the validated permissions array with its dependencies
 * @param {[String]} permissions [string]
 * @returns {[String]} [string] validated permissions with dependencies
 */
const addDependedPermissions = (permissions) => {
  // Check if the given permissions is in the auth.PERMS obj
  console.log("validatePermissions | permissions:", permissions);
  const validatedPermissions = permissions.filter(
    (permission) =>
      Object.values(auth.PERMS).includes(permission) &&
      permission !== auth.PERMS.protected
    // because only the main super admin can be protected (it will be created in the project's init. state)
  );

  console.log(
    "validatePermissions | validatedPermissions:",
    validatedPermissions
  );

  // Get the valid auth.PERMS dependencies
  let dependencies = [];
  const getDependencies = (value) => {
    console.log("validatePermissions | value:", value);

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

// IT ONLY WORKS WITH SINGLE DEPENDENCY VALUES, SO IF A PERM HAS MULTIPLE DEPS THAN IT IS NOT WORKING YET
const removeDependedPermissions = (permissions) => {
  /*
      permissions = ['update', 'insert', 'asd']
    
      filter all permissions and remove perms that not in the PERMS obj (so they're not valid permission for our case)
    
      valid permissions = ['update', 'insert']
    
      loop through valid permissions and check each element's deps if in the valid permissions
      if not, remove that permission from valid permissions
      
      after the loop, return valid permissions
      
      */
  // Check if the given permissions is in the PERMS obj
  let validatedPermissions = permissions.filter(
    (permission) => Object.values(auth.PERMS).includes(permission) /*&&
      permission !== auth.PERMS.protected*/
    // because only the main super admin can be protected (it will be created in the project's init. state)
  );

  const validatedPermissionsCopy = permissions.filter(
    (permission) => Object.values(auth.PERMS).includes(permission) /*&&
      permission !== auth.PERMS.protected*/
    // because only the main super admin can be protected (it will be created in the project's init. state)
  );

  const check = (array) => {
    array.forEach((perm) => {
      console.log("perm", perm);
      const actualDependencies = PERMS_DEPENDENCIES[perm];
      console.log("actualDependencies", actualDependencies);
      actualDependencies.forEach((actualDep) => {
        if (!validatedPermissions.includes(actualDep)) {
          validatedPermissions = validatedPermissions.filter(
            (item) => item !== perm
          );
          check(validatedPermissions);
        } else return;
      });
    });
  };
  check(validatedPermissionsCopy);

  // Entry point of the get dependencies
  // Loop through the validated pemrs and call the function each element recursively
  //validatedPermissions.map((validatedPerm) => getDependencies(validatedPerm));

  return validatedPermissions;
};

// const isLoggedIn = () => {
//   // console.log(localStorage.getItem("accesstoken"));
//   // console.log(localStorage.getItem("accesstoken") !== "");

//   // TODO: If there is no access token or expired but there is refresh token -> redirect refreshToken gql resolver and get a new token. If it's failed too, then redirect login page

//   return (
//     localStorage.getItem("accesstoken") !== "" &&
//     localStorage.getItem("accesstoken") !== null
//   );
// };

// const getUserId = () => {
//   return jwt(localStorage.getItem("accesstoken")).sub;
// };

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
  return hash.toString();
};

// const getHash = (text) => {
//   // call a hashing algo that returns a unique integer
//   return hashString(text);
// };

const getDict = async ({ hash, lang }) => {
  if (!hash || !lang) {
    return null;
  }
  return fetch("http://localhost:3000/graphql", {
    method: "POST",
    //mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: print(GET_DICT),
      variables: { hash: hash, lang: lang },
    }),
  })
    .then((res) => res.json())
    .then((result) => result?.data?.getDict)
    .catch((err) => console.log(err));
};

const getMoreDict = async ({ hashes, lang }) => {
  console.log("getMoreDict | hashes", hashes);
  console.log("getMoreDict | lang:", lang);
  if (!hashes || !lang) {
    return null;
  }
  return (
    fetch("http://localhost:3000/graphql", {
      method: "POST",
      //mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: print(GET_MOREDICT),
        variables: { hashes: hashes, lang: lang },
      }),
    })
      .then((res) => res.json())
      .then((result) => result?.data?.getMoreDict)
      // .then((result) => console.log(result))
      .catch((err) => console.log(err))
  );
};

// const getDictTEST = async () => {
//   return fetch("http://localhost:3000/graphql", {
//     method: "POST",
//     mode: "cors",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       query: `
//       query GetDict($hash: Int!, $lang: String!) {
//         getDict(hash: $hash, lang: $lang)
//       }
//     `,
//       variables: {
//         hash: 1,
//         lang: "hu",
//       },
//     }),
//   })
//     .then((res) => res.json())
//     .then((result) => result);
// };
const createDict = async ({ hash, lang, text }) => {
  if (!hash || !lang || !text) {
    console.log("inside createDict func: ", hash, lang, text);
    return "asfasfas";
  }
  return fetch("http://localhost:3000/graphql", {
    method: "POST",
    //mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: print(CREATE_DICT),
      variables: { hash: hash, lang: lang, text: text },
    }),
  })
    .then((res) => res.json())
    .then((res) => console.log(res))
    .then((result) => result.data.createMoreDict);
};

const createMoreDict = async ({ texts, lang }) => {
  if (!lang || !texts) {
    console.log("createMoreDict: ", lang, texts);
    return "asfasfas";
  }
  return (
    fetch("http://localhost:3000/graphql", {
      method: "POST",
      //mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: print(CREATE_MOREDICT),
        variables: { lang: lang, texts: texts },
      }),
    })
      .then((res) => res.json())
      // .then((res) => console.log(res))
      .then((result) => result?.data?.createMoreDict)
      .catch((err) => console.log(err))
  );
};

/**
 * A React and ApolloClient based implementation
 *
 * Usage: inside a React func component:
 * 1) Import this translate func
 * 2) Declare a wrapper function that gets the lang from the context and pass to the translate func
 * (like: const getText = (text) ... { const lang = useContext(...); return translate(text, lang) })
 * 3) Call everywhere that wrapper func (like: getText(textToTranslate))
 * @param text String The text to translate
 * @param lang String The language to translate
 * @returns String The translated text
 */
const translate = async (text, lang) => {
  //const lang = getLangFromContext(); //en

  // because every hash in the DB is a hashed value from an English text
  if (lang === "en") {
    return text;
  }

  // hash the text
  const hash = hashString(text); //login

  // CASHING like Redis in order to lower the DB operations (it is reading which is fast, but why not taking care of the DB if we could)
  // is it necessary? because React cashing the page html data if we use react-router

  // fetch the text data from DB according to the hash
  const result = await getDict({ hash, lang });

  // if there is no data with the given hash and lang combination
  if (!result) {
    // create an entry in the DB with the hash lang combination
    // it'll return this like a result: `${lang}_${text}`
    // later we can translate the text manually in the DB

    // return the created entry result
    return await createDict({ hash, lang, text });
  }
  return result;
};

const translateMore = async (textObject, lang) => {
  // textObject: {productManager: "Product Manager"}

  // because every hash in the DB is a hashed value from an English text
  if (lang === "en") {
    return textObject;
  }
  const resultObject = {};
  const hashesObjForGet = {};
  const textsObjForCreate = {};
  for (const [textKey, textValue] of Object.entries(textObject)) {
    const hash = hashString(textValue); //login
    hashesObjForGet[textKey] = hash;
  }
  console.log("translateMore | hashesObjForGet", hashesObjForGet);

  const hashesStringForGet = JSON.stringify(hashesObjForGet);
  console.log("translateMore | hashesStringForGet", hashesStringForGet);

  const getMoreDictResult = await getMoreDict({
    hashes: hashesStringForGet,
    lang,
  });
  console.log("translateMore | getMoreDictResult", getMoreDictResult);
  let resultsObj = JSON.parse(getMoreDictResult);
  console.log("translateMore | resultsObj", resultsObj);

  for (const [resultKey, resultValue] of Object.entries(resultsObj)) {
    if (resultValue === "false") {
      console.log("translateMore | no value in DB:", resultKey);
      const text = textObject[resultKey];
      const hash = hashString(text);
      textsObjForCreate[resultKey] = [hash, text];
    }
    resultObject[resultKey] = resultValue;
  }
  console.log("translateMore | textsObjForCreate", textsObjForCreate);
  if (Object.keys(textsObjForCreate).length > 0) {
    const creationResult = await createMoreDict({
      texts: JSON.stringify(textsObjForCreate),
      lang,
    });
    console.log("translateMore | creationResult", creationResult);
    const creationResultObj = JSON.parse(creationResult);
    resultsObj = { ...resultsObj, creationResultObj };
  }

  console.log("translateMore | resultObject", resultObject);
  return resultObject;
};

const getErrorMessageCode = (errorMessage) => {
  const messageAndCode = errorMessage.split("$");
  return { message: messageAndCode[0], code: messageAndCode[1] };
};

const createNotification = ({ title, message, type }) => {
  Store.addNotification({
    title: title,
    message: message,
    type: type,
    insert: "top",
    container: "top-right",
    animationIn: ["animate__animated", "animate__fadeIn"],
    animationOut: ["animate__animated", "animate__fadeOut"],
    dismiss: {
      duration: 5000,
      onScreen: true,
      pauseOnHover: true,
    },
  });
};

const errorCodePrefix = "$";

const userErrorCodes = {
  userNotFound: "USER_NOT-FOUND",
  userDeleteFirst: "USER_DELETE-FIRST",
  userAlreadyDeleted: "USER_ALREADY-DELETED",
  userAlreadyRestored: "USER_ALREADY-RESTORED",
  userEmptyUpdate: "USER_EMPTY-UPDATE",
  userEmailExists: "USER_EXISTED-EMAIL",
  userUsernameExists: "USER_EXISTED-USERNAME",
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

const validateInput = (input, UIText, validationPattern) => {
  if (validationPattern.test(input)) {
    const wrongCharacter = input[input.length - 1];
    createNotification({
      title: `${UIText.wrongCharacter}: ` + wrongCharacter,
      message: `${UIText.wrongCharacters}: ` + "[ ] ( ) * +",
      type: "warning",
    });
    input = input.replace(validationPattern, "");
  }
  console.log("valid input:", input);
  return input;
};

const validateProductInput = (input, UIText) => {
  const validationPattern = new RegExp(/[\[\]\\\(\)*+]/gi);
  return validateInput(input, UIText, validationPattern);
};

const validateUserEmailInput = (input, UIText) => {
  const validationPattern = new RegExp(/[\[\]\\\(\)*+]/gi);
  return validateInput(input, UIText, validationPattern);
};

const validateUserUsernameInput = (input, UIText) => {
  const validationPattern = new RegExp(/[\[\]\\\(\)*+]/gi);
  return validateInput(input, UIText, validationPattern);
};

const validateUserPasswordInput = (input, UIText) => {
  const validationPattern = new RegExp(/[\[\]\\\(\)*+]/gi);
  return validateInput(input, UIText, validationPattern);
};

export {
  auth,
  addDependedPermissions,
  removeDependedPermissions,
  translate,
  getDict,
  createDict,
  // translateMore,
  hashString,
  getMoreDict,
  createMoreDict,
  createNotification,
  getErrorMessageCode,
  productErrorCodes,
  userErrorCodes,
  errorCodePrefix,
  validateProductInput,
  validateUserEmailInput,
  validateUserUsernameInput,
  validateUserPasswordInput,
};
