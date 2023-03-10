import React, { useState, useEffect, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_VALIDUSERS } from "../queries/userQueries";
import { UPDATE_PERMISSIONS } from "../mutations/userMutations";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FcCancel } from "react-icons/fc";
import { BsShieldShaded } from "react-icons/bs";
import { TbCrown } from "react-icons/tb";

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
import UserBlockUnblockModal from "../components/modals/UserBlockUnblockModal";
import UserPermsRow from "../components/user/UserPermsRow";

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

  const [pendingUsers, setPendingUsers] = useState([]);

  const [editMode, setEditMode] = useState(false);

  const [handleCustomError] = useCustomError();

  useEffect(() => {
    if (data?.validUsers) {
      setPendingUsers(data.validUsers);
    }
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
    // console.log("users:", users);
    const userIdFromEdit = e.target.value;
    const permFromEdit = e.target.name;
    let usersDeepCopy = structuredClone(pendingUsers);
    //console.log("usersDeepCopy:", usersDeepCopy);
    let user = usersDeepCopy.find((user) => user.id === userIdFromEdit);

    //console.log("user BEFORE click:", user);
    //console.log(user);

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
    setPendingUsers(usersDeepCopy);
    //console.log("user after click:", user);
  };

  const handlePermsEditCancel = () => {
    setEditMode((oldValue) => !oldValue);
    setPendingUsers([]);
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

  if (pendingUsers && data && !loading && !error)
    return (
      <>
        {/* {console.log("users:", pendingUsers)} */}
        {!editMode ? (
          <Button
            className={"mt-5"}
            onClick={() => setEditMode((oldValue) => !oldValue)}
            style={{ width: "100%" }}
          >
            Edit
          </Button>
        ) : (
          <>
            <Button
              className={"mt-5"}
              onClick={handlePermsEditCancel}
              style={{ width: "50%" }}
            >
              Cancel
            </Button>
            <UserUpdatePermsModal
              users={pendingUsers}
              originalUsers={data.validUsers}
              setEditMode={setEditMode}
              formatPerm={formatPerm}
              affectedUsers={pendingUsers.filter(
                (user) =>
                  !JSON.stringify(data.validUsers).includes(
                    JSON.stringify(user)
                  )
              )}
            />
          </>
        )}
        <div className="table-responsive h-50 " style={{ maxHeight: "600px" }}>
          {/* tableContainer */}
          <Table
            //responsive
            //striped
            hover
            bordered
            className={`table table-sm table-${
              darkMode ? "dark" : "secondary"
            } mt-2 border-${darkMode ? "secondary" : "dark"} h-75 `}
          >
            <thead>
              <tr key={"mainHeaderKey"}>
                <th className={"text-center align-middle th"} rowSpan={3}>
                  Username
                </th>
                <th colSpan={productPermsCount} className={"text-center th"}>
                  products
                </th>
                <th
                  colSpan={usersPermsCount + 1}
                  className={"table-active text-center th-sm"}
                >
                  users
                </th>
              </tr>
              <tr>
                <th
                  colSpan={productPermsReadCount}
                  className={"text-center th-sm"}
                >
                  read
                </th>
                <th
                  colSpan={productPermsCount - productPermsReadCount}
                  className={"text-center th-sm"}
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
                <th colSpan={2} className={"table-active"}></th>
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
              {pendingUsers.map((pendingUser, uindex) => {
                // console.log("inside view:", pendingUser);
                return (
                  <UserPermsRow
                    data={data}
                    pendingUser={pendingUser}
                    pendingUsers={pendingUsers}
                    setPendingUsers={setPendingUsers}
                    editMode={editMode}
                    uindex={uindex}
                  />
                );
              })}
            </tbody>
          </Table>
        </div>
      </>
    );
}

export default UsersPermissionsPage;
