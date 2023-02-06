import React, { useContext } from "react";
import { redirect } from "react-router-dom";
import jwt from "jwt-decode";
import { GET_DICT, GET_MOREDICT } from "../queries/dictQueries";
import { CREATE_DICT, CREATE_MOREDICT } from "../mutations/dictMutations";
import { print } from "graphql/language/printer";

const isSet = (permission) => {
  return localStorage.getItem("permissions").includes(permission);
};

const isLoggedIn = () => {
  console.log(localStorage.getItem("accesstoken"));
  console.log(localStorage.getItem("accesstoken") !== "");

  // TODO: If there is no access token or expired but there is refresh token -> redirect refreshToken gql resolver and get a new token. If it's failed too, then redirect login page

  return (
    localStorage.getItem("accesstoken") !== "" &&
    localStorage.getItem("accesstoken") !== null
  );
};

const getUserId = () => {
  return jwt(localStorage.getItem("accesstoken")).sub;
};

const handleCustomError = (error, navigate, getRefreshToken) => {
  console.log(error);
  if (
    error.message === "Please log in again!" ||
    error.message === "Please log in first!"
  ) {
    if (!navigate) {
      throw new Error(
        "The navigate parameter is not provided for the handleCustomError function in the helper.js file!"
      );
    }
    // redirect to logout, where all client side data will be removed and will be redirected to login
    navigate("/logout", { replace: true });
  }

  if (
    error.message ===
    "Expired access token! REDIRECT refreshToken RESOLVER REACT"
  ) {
    if (!getRefreshToken) {
      throw new Error(
        "The getRefreshToken parameter is not provided for the handleCustomError function in the helper.js file!"
      );
    }
    getRefreshToken();
    //navigate(`/viewer/refreshtoken/${getUserId()}`);
  }
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

export {
  isSet,
  isLoggedIn,
  getUserId,
  handleCustomError,
  translate,
  getDict,
  createDict,
  // translateMore,
  hashString,
  getMoreDict,
  createMoreDict,
  getErrorMessageCode,
};
