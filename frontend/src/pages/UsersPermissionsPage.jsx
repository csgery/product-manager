import React, { useState, useEffect, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_VALIDUSERS } from "../queries/userQueries";
import { UPDATE_PERMISSIONS } from "../mutations/userMutations";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  auth,
  addDependedPermissions,
  removeDependedPermissions,
  createNotification,
} from "../helper/helper";
import SpinnerCustom from "../components/SpinnerCustom";
import useCustomError from "../helper/hooks/useCustomError";
import { UITextContext } from "../components/TranslationWrapper";
import { DarkModeContext } from "../App";
import UserUpdatePermsModal from "../components/modals/UserUpdatePermsModal";

function UsersPermissionsPage() {
  const { loading, error, data } = useQuery(GET_VALIDUSERS);

  const UIText = useContext(UITextContext);
  const darkMode = useContext(DarkModeContext);

  const [
    updatePermissions,
    { data: permsData, loading: permsLoading, error: permsError },
  ] = useMutation(UPDATE_PERMISSIONS, {
    refetchQueries: [GET_VALIDUSERS],
    // variables: { arrayString },
    // update(cache, { data: { data } }) {
    //   const { validProducts } = cache.readQuery({ query: GET_VALIDPRODUCTS });
    //   console.log("addProduct:", addProduct);
    //   cache.writeQuery({
    //     query: GET_VALIDPRODUCTS,
    //     data: { validProducts: [...validProducts, addProduct] },
    //   });
    // },
  });

  const [users, setUsers] = useState([]);

  const [editMode, setEditMode] = useState(false);

  const [handleCustomError] = useCustomError();

  useEffect(() => {
    if (data?.validUsers) setUsers(data.validUsers);
  }, [data?.validUsers, editMode]);

  const formatPerm = (right) => {
    if (right.includes("_")) {
      const result = right.split("_");
      if (result[0].toLowerCase().includes("updateuser")) {
        return result[0].toLowerCase().replace("updateuser", "updateperms");
      }
      return result[0].toLowerCase().replace("read", "");
    } else {
      return right.toLowerCase();
    }
  };

  const productPermsCount = Object.keys(auth.PERMS).filter((item) =>
    item.toLowerCase().includes("product")
  ).length;
  const usersPermsCount = Object.keys(auth.PERMS).filter(
    (item) =>
      item.toLowerCase().includes("user") ||
      item.toLowerCase().includes("protected")
  ).length;

  const productPermsReadCount = Object.keys(auth.PERMS).filter(
    (item) =>
      item.toLowerCase().includes("product") &&
      item.toLowerCase().includes("read")
  ).length;

  const usersPermsReadCount = Object.keys(auth.PERMS).filter(
    (item) =>
      item.toLowerCase().includes("user") && item.toLowerCase().includes("read")
  ).length;

  const handleChange = (e) => {
    console.log("users:", users);
    const userIdFromEdit = e.target.value;
    const permFromEdit = e.target.name;
    let usersDeepCopy = structuredClone(users);
    console.log("usersDeepCopy:", usersDeepCopy);
    let user = usersDeepCopy.find((user) => user.id === userIdFromEdit);

    console.log("user BEFORE click:", user);
    console.log(user);

    if (user.permissions.includes(permFromEdit)) {
      // console.log(
      //   validatePermissions(
      //     user.permissions.filter((perm) => perm !== permFromEdit)
      //   )
      // );
      user.permissions = removeDependedPermissions(
        user.permissions.filter((perm) => perm !== permFromEdit)
      );
    } else {
      user.permissions = addDependedPermissions([
        ...user.permissions,
        permFromEdit,
      ]);
    }
    setUsers(usersDeepCopy);
    console.log("user after click:", user);
  };

  const handlePermsEditCancel = () => {
    setEditMode((oldValue) => !oldValue);
    setUsers([]);
  };

  const isInputCBDisabled = (actualValidUser, actualPermKey) => {
    if (!editMode) {
      return true;
    }
    if (auth.PERMS[actualPermKey] === auth.PERMS.readOwn_user) {
      return true;
    }
    if (auth.PERMS[actualPermKey] === auth.PERMS.owner) {
      return true;
    }
    if (actualValidUser.id === auth.getUserId()) {
      return true;
    }
    if (
      actualValidUser.permissions.includes(auth.PERMS.owner) &&
      auth.PERMS[actualPermKey] === auth.PERMS.protected
    ) {
      return true;
    }
    if (
      !auth.isSet("owner") &&
      auth.PERMS[actualPermKey] === auth.PERMS.protected
    ) {
      return true;
    }
    return false;
  };

  if (loading) return <SpinnerCustom />;

  if (error) {
    handleCustomError(error);
  }

  if (users && !loading && !error)
    return (
      <>
        {!editMode ? (
          <Button
            className={"mt-5"}
            onClick={() => setEditMode((oldValue) => !oldValue)}
          >
            Edit
          </Button>
        ) : (
          <>
            <Button className={"mt-5"} onClick={handlePermsEditCancel}>
              Cancel
            </Button>
            <UserUpdatePermsModal
              users={users}
              originalUsers={data.validUsers}
              setEditMode={setEditMode}
              formatPerm={formatPerm}
              affectedUsers={users.filter(
                (user) =>
                  !JSON.stringify(data.validUsers).includes(
                    JSON.stringify(user)
                  )
              )}
            />
          </>
        )}
        <Table
          responsive
          //striped
          hover
          bordered
          className={`table-sm table-${
            darkMode ? "dark" : "secondary"
          } mt-2 border-${darkMode ? "secondary" : "dark"}`}
        >
          <thead>
            <tr key={"mainHeaderKey"}>
              <th className={"text-center align-middle"} rowSpan={3}>
                Username
              </th>
              <th colSpan={productPermsCount} className={"text-center"}>
                products
              </th>
              <th
                colSpan={usersPermsCount}
                className={"table-active text-center"}
              >
                users
              </th>
            </tr>
            <tr>
              <th colSpan={productPermsReadCount} className={"text-center"}>
                read
              </th>
              <th
                colSpan={productPermsCount - productPermsReadCount}
                className={"text-center"}
              >
                modify
              </th>
              <th
                colSpan={usersPermsReadCount}
                className={"table-active text-center"}
              >
                read
              </th>
              <th
                colSpan={usersPermsCount - usersPermsReadCount - 1}
                className={"table-active text-center"}
              >
                modify
              </th>
              <th className={"table-active"}></th>
            </tr>
            <tr key={"subHeaderKey"}>
              {Object.keys(auth.PERMS).map((item, index) => (
                <th className={index < 7 ? "" : "table-active"} key={index}>
                  {formatPerm(item)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {users.map((validUser, uindex) => {
              console.log(validUser);
              return (
                <tr key={uindex}>
                  <td key={uindex} className={"text-center align-middle"}>
                    {validUser.username}
                  </td>
                  {Object.keys(auth.PERMS).map((permKey, pindex) => {
                    return (
                      <td
                        key={pindex}
                        className={
                          (pindex < 7 ? "" : "table-active") + " text-center"
                        }
                        //onClick={(e) => handleClick(e)}
                      >
                        <input
                          className={
                            (pindex < 7 ? "" : "table-active ") +
                            "form-check-input text-center"
                          }
                          type="checkbox"
                          name={auth.PERMS[permKey]}
                          value={validUser.id}
                          onChange={(e) => handleChange(e)}
                          disabled={isInputCBDisabled(validUser, permKey)}
                          checked={validUser.permissions.includes(
                            auth.PERMS[permKey]
                          )}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </>
    );
}

export default UsersPermissionsPage;
