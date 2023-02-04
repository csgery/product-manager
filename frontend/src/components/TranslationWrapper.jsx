import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useContext,
} from "react";
import { createMoreDict, getMoreDict, hashString } from "./../helper/helper";
import { LangContext } from "../App";

export const UITextContext = createContext();

function TranslationWrapper({ children }) {
  const lang = useContext(LangContext);

  const translateMore = async (textObject, lang) => {
    // textObject: { productManager: "Product Manager" }

    // because every hash in the DB is a hashed value from an English text
    if (lang === "en") {
      return textObject;
    }

    let resultObject = {};
    const hashesObjForGet = {};
    const textsObjForCreate = {};

    // create hashes for the given object's texts
    for (const [textKey, textValue] of Object.entries(textObject)) {
      // textkey: name of the entry
      // textValue: the English text from sourcecode
      const hash = hashString(textValue); // login
      hashesObjForGet[textKey] = hash;
    }
    console.log("translateMore | hashesObjForGet", hashesObjForGet);

    // convert the hashes object to string
    const hashesStringForGet = JSON.stringify(hashesObjForGet);
    console.log("translateMore | hashesStringForGet", hashesStringForGet);

    // fetch translation data from DB
    const getMoreDictResult = await getMoreDict({
      hashes: hashesStringForGet,
      lang,
    });

    console.log("translateMore | getMoreDictResult", getMoreDictResult);

    // Convert fetched data to JSON obj
    let getResultsObj = JSON.parse(getMoreDictResult);
    console.log("translateMore | getResultsObj", getResultsObj);

    // Loop through the fetched data obj and if there is entries that has value of 'false' than add them to an object that will be the input of the createMoreDict() func
    for (const [resultKey, resultValue] of Object.entries(getResultsObj)) {
      if (resultValue === "false") {
        console.log("translateMore | no value in DB:", resultKey);
        const text = textObject[resultKey];
        const hash = hashString(text);
        textsObjForCreate[resultKey] = [hash, text];
      } else {
        resultObject[resultKey] = resultValue;
      }
    }
    console.log("translateMore | textsObjForCreate", textsObjForCreate);

    // If there's any entry that hasn't added yet to the dict DB
    if (Object.keys(textsObjForCreate).length > 0) {
      // Add the entries to the dict DB
      const creationResult = await createMoreDict({
        texts: JSON.stringify(textsObjForCreate),
        lang,
      });
      console.log("translateMore | creationResult", creationResult);
      // Convert creation return data to JSON obj
      const creationResultObj = JSON.parse(creationResult);
      // Loop through the creation result object and add each entry to the result object
      for (const [key, value] of Object.entries(creationResultObj)) {
        resultObject = { ...resultObject, [key]: value };
      }
    }

    console.log("translateMore | resultObject", resultObject);
    return resultObject;
  };

  const getMoreText = useCallback(async (textsObject) => {
    return await translateMore(textsObject, lang);
  });

  // const test = useCallback(async () => {
  //   return await fetchDictEntries({
  //     variables: {
  //       hashes: "12312",
  //       lang,
  //     },
  //   });
  // });

  const [UIText, setUIText] = useState(false);

  useEffect(() => {
    const UITextToTranslate = {
      // Navbar texts
      productManager: "Product Manager",
      products: "Products",
      deletedProducts: "Deleted Products",
      users: "Users",
      viewer: "Viewer",
      logout: "Logout",
      login: "Login",
      profile: "Profile",

      // Modal title texts
      deleteProductsTitle: "Delete Products",
      deleteProductTitle: "Delete Product",
      restoreProductsTitle: "Restore Products",
      restoreProductTitle: "Restore Product",
      removeProductsTitle: "Remove Products",
      removeProductTitle: "Remove Product",

      // Modal body texts
      deleteProductsText: "Are you sure to delete the following products?",
      deleteProductText: "Are you sure to delete the following product?",
      restoreProductsText: "Are you sure to restore the following products?",
      restoreProductText: "Are you sure to restore the following product?",
      removeProductsText: "Are you sure to remove the following products?",
      removeProductText: "Are you sure to remove the following product?",

      // Modal buttons text
      deleteButtonText: "Delete",
      restoreButtonText: "Restore",
      removeButtonText: "Remove",
      closeButtonText: "Close",
      deleteMultipleProductsButtonText: "Delete Multiple Products",
      removeRestoreMultipleProductsButtonText:
        "Remove/Restore Multiple Products",
      cancelButtonText: "Cancel",
      createButtonText: "Create",
      editButtonText: "Edit",

      // Create Product Modal
      createProductButtonText: "Create Product",
      name: "Name",
      shortID: "Short ID",
      quantity: "Quantity",

      // Searchbar
      wholeWordButtonText: "Whole Word",
      matchCaseButtonText: "Match Case",

      selectAllButtonText: "Select All",

      // 404 page
      pageNotFoundText: "Sorry, this page does not exist",
      goBackBTNText: "Go Back",

      // Edit product form
      productFormTitle: "Update Product Details",

      language: "Language",
      iconMode: "Icon Mode",
    };
    const fetchMoreData = async () => {
      //console.log(await getMoreText(UITextToTranslate));
      return await getMoreText(UITextToTranslate);
    };
    fetchMoreData().then((res) => setUIText(res));

    //test().then((res) => console.log("aoisfdjlajdflkdajsflkas", res));
  }, [lang]);

  if (!UIText) return <>loading...</>;

  return (
    <>
      {UIText && (
        <UITextContext.Provider value={UIText}>
          {children}
        </UITextContext.Provider>
      )}
    </>
  );
}

export default TranslationWrapper;
