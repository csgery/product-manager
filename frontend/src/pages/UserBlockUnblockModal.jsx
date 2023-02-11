import React, { useState, useContext, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { Button, Modal } from "react-bootstrap";
import { BLOCK_USER, UNBLOCK_USER } from "../mutations/userMutations";
import { GET_VALIDUSERS, GET_DELETEDUSERS } from "../queries/userQueries";
import useCustomError from "../helper/hooks/useCustomError";
import { DarkModeContext } from "../App";
import { createNotification, auth } from "../helper/helper";
import { UITextContext } from "../components/TranslationWrapper";
import { IconModeContext } from "../App";
import { TiCancel } from "react-icons/ti";
import { MdOutlineCancel, MdOutlineDoneOutline } from "react-icons/md";

function UserBlockUnblockModal({ userToModify, editMode, users, setUsers }) {
  const [show, setShow] = useState(false);
  const [canUserLogin, setCanUserLogin] = useState(userToModify.canLogin);

  const darkMode = useContext(DarkModeContext);
  const UIText = useContext(UITextContext);

  const [handleCustomError] = useCustomError();
  const [blockUser, { data: blockUserData }] = useMutation(BLOCK_USER, {
    refetchQueries: [GET_VALIDUSERS, GET_DELETEDUSERS],
  });
  const [unblockUser, { data: unblockUserData }] = useMutation(UNBLOCK_USER);

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
    let usersDeepCopy = structuredClone(users);
    let userRefFromUsers = usersDeepCopy.find(
      (user) => user.id === userToModify.id
    );

    if (userToModify.canLogin) {
      blockUser({ variables: { id: userToModify.id } })
        .then(() => {
          createNotification({
            title: "ok",
            message: "blocked",
            type: "success",
          });
          userRefFromUsers.canLogin = !userRefFromUsers.canLogin;
          setCanUserLogin((old) => !old);
          setUsers(usersDeepCopy);
        })
        .catch((err) => handleCustomError(err))
        .finally(() => setShow(false));
    } else {
      unblockUser({ variables: { id: userToModify.id } })
        .then(() => {
          createNotification({
            title: "ok",
            message: "unblocked",
            type: "success",
          });
          userRefFromUsers.canLogin = !userRefFromUsers.canLogin;
          setCanUserLogin((old) => !old);
          setUsers(usersDeepCopy);
        })
        .catch((err) => handleCustomError(err))
        .finally(() => setShow(false));
    }
  };

  const iconMode = useContext(IconModeContext);
  return (
    <>
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
            {userToModify.canLogin ? UIText.blockUser : UIText.unblockUser}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode && "bg-dark text-white"}>
          <h3>
            {userToModify.canLogin
              ? UIText.blockUserText
              : UIText.unblockUserText}
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
            ) : (
              UIText.createButtonText
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default UserBlockUnblockModal;
