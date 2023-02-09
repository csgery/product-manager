import React, { useState, useEffect, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_VALIDUSERS } from "../../queries/userQueries";
import { UPDATE_PERMISSIONS } from "../../mutations/userMutations";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { auth, createNotification } from "../../helper/helper";
import { Spinner } from "react-bootstrap";
import useCustomError from "../../helper/hooks/useCustomError";
import { UITextContext } from "../../components/TranslationWrapper";
import { DarkModeContext, IconModeContext } from "../../App";

function UserUpdatePermsModal({
  users,
  originalUsers,
  affectedUsers,
  setEditMode,
}) {
  const [showSavePermsModal, setShowSavePermsModal] = useState(false);

  //const { loading, error, data } = useQuery(GET_VALIDUSERS);

  const UIText = useContext(UITextContext);
  const darkMode = useContext(DarkModeContext);
  const iconMode = useContext(IconModeContext);
  const [handleCustomError] = useCustomError();

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

  const handlePermsEditSave = () => {
    const originalUsers_String = JSON.stringify(originalUsers);
    console.log("originalUsers", originalUsers_String);
    console.log("affectedUsers", affectedUsers);

    let result = [];
    affectedUsers.forEach((affectedUser) => {
      const oldPerms = originalUsers.find(
        (user) => user.id === affectedUser.id
      ).permissions;
      const newPerms = affectedUser.permissions;
      result = [...result, JSON.stringify(affectedUser)];
      console.log(
        `name: ${affectedUser.username}, oldPerms: ${oldPerms} newPerms: ${newPerms}`
      );
    });
    console.log("result", result);
    updatePermissions({ variables: { arrayString: result } })
      .then((res) => {
        createNotification({
          title: UIText.successfulOperation,
          message: UIText.successfullyModifiedPerms,
          type: "success",
        });
        setEditMode((oldValue) => !oldValue);
      })
      .catch((err) => handleCustomError(err));
  };

  return (
    <>
      <Button
        onClick={() => setShowSavePermsModal((old) => !old)}
        disabled={JSON.stringify(users) === JSON.stringify(originalUsers)}
      >
        Save
      </Button>

      <Modal
        show={showSavePermsModal}
        onHide={() => setShowSavePermsModal((old) => !old)}
      >
        <Modal.Header closeButton className={darkMode && "bg-dark text-white"}>
          <Modal.Title>{UIText.createProductButtonText}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode && "bg-dark text-white"}>
          <Table responsive>
            <thead>
              <tr>
                <th>name</th>
                <th>added perms</th>
                <th>removed perms</th>
              </tr>
            </thead>
            <tbody>
              {affectedUsers.map((affectedUser) => {
                return (
                  <tr>
                    <th>{affectedUser.username}</th>
                    <th>
                      {affectedUser.permissions
                        .filter(
                          (perm) =>
                            !originalUsers
                              .find(
                                (originalUser) =>
                                  originalUser.id === affectedUser.id
                              )
                              .permissions.includes(perm)
                        )
                        .map((perm) => `${perm} `)}
                    </th>
                    <th>
                      {originalUsers
                        .find(
                          (originalUser) => originalUser.id === affectedUser.id
                        )
                        .permissions.includes()}
                    </th>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer className={darkMode && "bg-dark text-white"}>
          <Button
            variant="danger"
            onClick={() => setShowSavePermsModal((old) => !old)}
          >
            {iconMode ? (
              <MdOutlineCancel style={{ fontSize: "1.6rem" }} />
            ) : (
              UIText.closeButtonText
            )}
          </Button>
          <Button variant="primary" onClick={handlePermsEditSave}>
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

export default UserUpdatePermsModal;
