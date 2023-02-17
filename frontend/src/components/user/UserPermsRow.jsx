import React, { useState, useEffect, useContext } from "react";
import Modal from "react-bootstrap/Modal";
import { FcCancel } from "react-icons/fc";
import { BsShieldShaded } from "react-icons/bs";
import { TbCrown } from "react-icons/tb";
import UserBlockUnblockModal from "../../components/modals/UserBlockUnblockModal";
import { UITextContext } from "../../components/TranslationWrapper";
import { DarkModeContext } from "../../App";
import {
  auth,
  addDependedPermissions,
  removeDependedPermissions,
  createNotification,
} from "../../helper/helper";

function UserPermsRow({
  pendingUser,
  pendingUsers,
  setPendingUsers,
  editMode,
  data,
  uindex,
}) {
  const UIText = useContext(UITextContext);
  const darkMode = useContext(DarkModeContext);

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
      actualValidUser.permissions.includes(auth.PERMS.owner) /*&&
      auth.PERMS[actualPermKey] === auth.PERMS.protected*/
    ) {
      return true;
    }
    if (
      !auth.isSet("owner") &&
      actualValidUser.permissions.includes(auth.PERMS.protected)
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

  return (
    <>
      <tr key={uindex} className={"text-center align-middle "}>
        <td
          key={uindex}
          className={"text-center align-middle prevent-linebreak "}
          //style={{ whiteSpace: "nowrap;" }}
        >
          <span className={!pendingUser.canLogin ? "text-danger" : "text-dark"}>
            {pendingUser.username}
          </span>
          {
            <UserBlockUnblockModal
              data-toggle="tooltip"
              data-placement="top"
              title={UIText.owner}
              userToModify={pendingUser}
              editMode={editMode}
              pendingUsers={pendingUsers}
              setPendingUsers={setPendingUsers}
            />
          }
          {data.validUsers
            .find((user) => user.id === pendingUser.id)
            .permissions.includes(auth.PERMS.protected) && (
            <BsShieldShaded
              data-toggle="tooltip"
              data-placement="top"
              title={UIText.protected}
              className="ms-1 align-middle text-success"
              style={{ fontSize: "1.3rem", marginBottom: "3px" }}
            />
          )}
          {data.validUsers
            .find((user) => user.id === pendingUser.id)
            .permissions.includes(auth.PERMS.owner) && (
            <TbCrown
              data-toggle="tooltip"
              data-placement="top"
              title={UIText.owner}
              className="ms-1 text-warning"
              style={{ fontSize: "1.8rem", marginBottom: "3px" }}
            />
          )}
        </td>
        {Object.keys(auth.PERMS).map((permKey, pindex) => {
          return (
            <td
              key={pindex}
              className={
                (pindex < 7 ? "" : "table-active overflowHidden ") +
                " text-center align-middle overflowHidden "
              }
              //onClick={(e) => handleClick(e)}
            >
              <input
                className={
                  (pindex < 7 ? "" : "table-active overflowHidden ") +
                  "form-check-input text-center overflowHidden "
                }
                type="checkbox"
                name={auth.PERMS[permKey]}
                value={pendingUser.id}
                onChange={(e) => handleChange(e)}
                disabled={isInputCBDisabled(pendingUser, permKey)}
                checked={pendingUser.permissions.includes(auth.PERMS[permKey])}
              />
            </td>
          );
        })}
      </tr>
    </>
  );
}

export default UserPermsRow;
