import React, { useState, useContext } from "react";
import { useMutation } from "@apollo/client";
import { Button, Modal } from "react-bootstrap";
import { BLOCK_USER, UNBLOCK_USER } from "../../mutations/userMutations";
import { GET_VALIDUSERS, GET_DELETEDUSERS } from "../../queries/userQueries";
import useCustomError from "../../helper/hooks/useCustomError";
import { DarkModeContext, IconModeContext } from "../../App";
import { createNotification, auth } from "../../helper/helper";
import { UITextContext } from "../TranslationWrapper";
import { TiCancel } from "react-icons/ti";
import { MdOutlineCancel, MdOutlineDoneOutline } from "react-icons/md";

function UserBlockUnblockModal({
  userToModify,
  editMode,
  pendingUsers,
  setPendingUsers,
}) {
  const [show, setShow] = useState(false);
  const [canUserLogin, setCanUserLogin] = useState(userToModify.canLogin);

  const darkMode = useContext(DarkModeContext);
  const UIText = useContext(UITextContext);

  const [handleCustomError] = useCustomError();
  const [blockUser, { data: blockUserData }] = useMutation(BLOCK_USER, {
    refetchQueries: [GET_VALIDUSERS, GET_DELETEDUSERS],
  });
  const [unblockUser, { data: unblockUserData }] = useMutation(UNBLOCK_USER, {
    refetchQueries: [GET_VALIDUSERS, GET_DELETEDUSERS],
  });

  const isModificationDisabled = () => {
    if (!editMode) {
      return true;
    }
    // if (!auth.isSet(auth.PERMS.updateUser_permissions)) {
    //   return true;
    // }
    if (userToModify.permissions.includes(auth.PERMS.owner)) {
      return true;
    }
    if (
      userToModify.permissions.includes(auth.PERMS.protected) &&
      !auth.isSet(auth.PERMS.owner)
    ) {
      return true;
    }
    return false;
  };

  const handleModifying = () => {
    // we have to deeply copy the object in order to modify that because the original is read-only
    let pendingUsersDeepCopy = structuredClone(pendingUsers);
    let userRefFromUsers = pendingUsersDeepCopy.find(
      (user) => user.id === userToModify.id
    );

    if (canUserLogin) {
      blockUser({ variables: { id: userToModify.id } })
        .then(() => {
          userRefFromUsers.canLogin = false;
          // setCanUserLogin((old) => !old);
          setCanUserLogin(false);
          setPendingUsers(pendingUsersDeepCopy);
          createNotification({
            title: UIText.successfulOperation,
            message:
              userToModify.username + " " + UIText.successfullyBlockedUser,
            type: "success",
          });
        })
        .catch((err) => handleCustomError(err))
        .finally(() => setShow(false));
    } else {
      unblockUser({ variables: { id: userToModify.id } })
        .then(() => {
          userRefFromUsers.canLogin = true;
          // setCanUserLogin((old) => !old);
          setCanUserLogin(true);
          setPendingUsers(pendingUsersDeepCopy);
          createNotification({
            title: UIText.successfulOperation,
            message:
              userToModify.username + " " + UIText.successfullyUnblockedUser,
            type: "success",
          });
        })
        .catch((err) => handleCustomError(err))
        .finally(() => setShow(false));
    }
  };

  const iconMode = useContext(IconModeContext);
  return (
    <>
      {console.log(
        `username: ${userToModify.username} username.canlogin: ${userToModify.canLogin} canUserLogin: ${canUserLogin}`
      )}

      <span
        data-toggle="tooltip"
        data-placement="top"
        title={canUserLogin ? UIText.unblocked : UIText.blocked}
      >
        <Button
          className="ms-1 p-0 align-middle text-center bg-dark border-dark"
          style={{ marginBottom: "1px" }}
          disabled={isModificationDisabled()}
          onClick={() => setShow(true)}
        >
          <TiCancel
            className={
              canUserLogin
                ? "align-middle text-center text-primary "
                : "align-middle text-center text-danger "
            }
            style={{ fontSize: "1.3rem", marginBottom: "2px" }}
          />
        </Button>
      </span>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton className={darkMode && "bg-dark text-white"}>
          <Modal.Title>
            {canUserLogin ? UIText.blockUser : UIText.unblockUser}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode && "bg-dark text-white"}>
          <h3>
            {canUserLogin ? UIText.blockUserText : UIText.unblockUserText}
          </h3>
          <h4>{userToModify.username}</h4>
        </Modal.Body>
        <Modal.Footer className={darkMode && "bg-dark text-white"}>
          <Button variant="danger" onClick={() => setShow(false)}>
            {iconMode ? (
              <MdOutlineCancel style={{ fontSize: "1.6rem" }} />
            ) : (
              UIText.closeButtonText
            )}
          </Button>
          <Button variant="primary" onClick={handleModifying}>
            {iconMode ? (
              <MdOutlineDoneOutline style={{ fontSize: "1.6rem" }} />
            ) : canUserLogin ? (
              UIText.blockUser
            ) : (
              UIText.unblockUser
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default UserBlockUnblockModal;
