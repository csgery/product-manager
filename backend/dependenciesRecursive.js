// ****

// ****

// ***** GO DOWN TO TEST****

// const PERMS = {
//   // users
//   readOwn_user: "read:own_user",
//   readAny_user: "read:any_user",
//   readInvalid_users: "read:invalid_users",
//   kaka: "kaka",
//   pisi: "pisi",
// };

// const PERMS_DEPENDENCIES = {
//   // users
//   [PERMS.readOwn_user]: [],
//   [PERMS.pisi]: [],
//   [PERMS.kaka]: [PERMS.pisi],
//   [PERMS.readAny_user]: [PERMS.readOwn_user],
//   [PERMS.readInvalid_users]: [PERMS.readAny_user, PERMS.kaka],
// };

// const validatePermissions = (permissions) => {
//   const validatedPermissions = permissions.filter(
//     (permission) =>
//       Object.values(PERMS).includes(permission) &&
//       permission !== PERMS.protected
//   );
//   let dependencies = [];
//   const getDependencies = (value) => {
//     for (const [depKey, depValue] of Object.entries(PERMS_DEPENDENCIES)) {
//       //console.log(depKey + "----" +depValue)
//       if (depKey === value && !dependencies.includes(value)) {
//         //console.log(value)
//         dependencies.push(value);
//         depValue.map((actual) => getDependencies(actual));
//         //getDependencies(depValue);
//       }
//     }
//   };
//   validatedPermissions.map((validatedPerm) => getDependencies(validatedPerm));

//   return dependencies;
// };
// //console.log([[PERMS.readInvalid_users]])
// //console.log(PERMS_DEPENDENCIES)
// const perms = ["read:invalid_users"];
// console.log(`'${perms}' dependencies are:`);
// console.log(validatePermissions(perms));

// *****
// ***** Optimised with If
// *****
const PERMS = {
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

const PERMS_DEPENDENCIES = {
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
/**
 *
 * @param {[String]} permissions
 * @returns [string]
 */
const validatePermissions = (permissions) => {
  // Check if the given permissions is in the PERMS obj
  const validatedPermissions = permissions.filter(
    (permission) =>
      Object.values(PERMS).includes(permission) &&
      permission !== PERMS.protected
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

console.log(validatePermissions(["read:any_user"]));

const perms = [];
for (const [elemKey, elemValue] of Object.entries(PERMS)) {
  perms.push(elemValue);
}
// to test the time of get all entries dependencies
console.time("getDeps");
console.log(validatePermissions(perms));
console.timeEnd("getDeps");

// *****
// ***** Not Optimised For Loop
// *****
// const PERMS = {
//   // basic permission
//   protected: "protected",

//   // users
//   readOwn_user: "read:own_user",
//   readAny_user: "read:any_user",
//   readInvalid_users: "read:invalid_users",
//   insertAny_user: "insert:any_user",
//   //updateAny_user: "update:any_user", //update only yourself
//   updateUser_permissions: "update:user_permissions",
//   softdeleteAny_user: "softdelete:any_user",
//   restoreSoftdelete_user: "restoreSoftdelete:user",
//   deleteAny_user: "delete:any_user",

//   // products
//   readInvalid_products: "read:invalid_products",
//   insertAny_product: "insert:any_product",
//   updateAny_product: "update:any_product",
//   softdeleteAny_product: "softdelete:any_product",
//   restoreSoftdelete_product: "restoreSoftdelete:product",
//   deleteAny_product: "delete:any_product",
// };

// const PERMS_DEPENDENCIES = {
//   // users
//   [PERMS.readOwn_user]: [],
//   [PERMS.readAny_user]: [PERMS.readOwn_user],
//   [PERMS.readInvalid_users]: [PERMS.readAny_user],

//   [PERMS.insertAny_user]: [PERMS.readAny_user],
//   //update only yourself
//   //[PERMS.updateAny_user]: [PERMS.insertAny_user],
//   [PERMS.insertAny_user]: [PERMS.readAny_user],
//   [PERMS.softdeleteAny_user]: [PERMS.readInvalid_users],
//   [PERMS.restoreSoftdelete_user]: [PERMS.softdeleteAny_user],
//   [PERMS.deleteAny_user]: [PERMS.softdeleteAny_user],

//   [PERMS.updateUser_permissions]: [PERMS.readInvalid_users],

//   // products
//   [PERMS.readInvalid_products]: [],
//   [PERMS.insertAny_product]: [PERMS.readInvalid_products],
//   [PERMS.updateAny_product]: [PERMS.insertAny_product],
//   [PERMS.softdeleteAny_product]: [PERMS.readInvalid_products],
//   [PERMS.restoreSoftdelete_product]: [PERMS.softdeleteAny_product],
//   [PERMS.deleteAny_product]: [PERMS.softdeleteAny_product],
// };
// /**
//  *
//  * @param {[String]} permissions
//  * @returns [string]
//  */
// const validatePermissions = (permissions) => {
//   // Check if the given permissions is in the PERMS obj
//   const validatedPermissions = permissions.filter(
//     (permission) =>
//       Object.values(PERMS).includes(permission) &&
//       permission !== PERMS.protected
//   );
//   // Get the valid perms dependencies
//   let dependencies = [];
//   const getDependencies = (value) => {
//     // Loop through the PERMS_DEPENDENCIES object
//     for (const [depKey, depValue] of Object.entries(PERMS_DEPENDENCIES)) {
//       // if the actual dep is equal the actual tested value AND that value is not in the output dep array
//       if (depKey === value && !dependencies.includes(value)) {
//         // Add to the output array the actual dep value
//         dependencies.push(value);
//         // and loop through that actual value's dependencies too and each dep call this function
//         depValue.map((actual) => getDependencies(actual));
//       }
//     }
//   };
//   // Entry point of the get dependencies
//   // Loop through the validated pemrs and call the function each element recursively
//   validatedPermissions.map((validatedPerm) => getDependencies(validatedPerm));

//   return dependencies;
// };

// // to test the time of get all entries dependencies
// console.time("getDeps");
// console.log(validatePermissions(perms));
// console.timeEnd("getDeps");
