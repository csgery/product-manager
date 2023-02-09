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
    (permission) =>
      Object.values(PERMS).includes(permission) &&
      permission !== PERMS.protected
    // because only the main super admin can be protected (it will be created in the project's init. state)
  );

  const validatedPermissionsCopy = permissions.filter(
    (permission) =>
      Object.values(PERMS).includes(permission) &&
      permission !== PERMS.protected
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

const PERMS = {
  // products
  readValid_products: "read:valid_products",
  readInvalid_products: "read:invalid_products",
  insert_product: "insert:product",
  update_product: "update:product",
  delete_product: "delete:product",
  restore_product: "restore:product",
  remove_product: "remove:product",
};

const PERMS_DEPENDENCIES = {
  // users
  [PERMS.readValid_products]: [],
  [PERMS.readInvalid_products]: [PERMS.readValid_products],
  [PERMS.insert_product]: [PERMS.readValid_products],
  [PERMS.update_product]: [PERMS.insert_product],
  [PERMS.delete_product]: [PERMS.readInvalid_products],
  [PERMS.restore_product]: [PERMS.delete_product],
  [PERMS.remove_product]: [PERMS.delete_product],
};

console.log(
  removeDependedPermissions([
    "update:product",
    "insert:product",
    "read:valid_products",
  ])
);
