import { useContext, useState, useCallback, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { Button, Modal } from "react-bootstrap";
import { useMutation, useLazyQuery } from "@apollo/client";
import {
  REMOVE_PRODUCT,
  RESTOREDELETED_PRODUCT,
  DELETE_PRODUCT,
} from "../../mutations/productMutations";
import {
  DELETE_USER,
  RESTORE_USER,
  REMOVE_USER,
} from "../../mutations/userMutations";
import {
  GET_VALIDPRODUCTS,
  GET_DELETEDPRODUCTS,
} from "../../queries/productQueries";
import { useNavigate } from "react-router-dom";
import { DarkModeContext, LangContext } from "../../App";
import { TbTrash, TbTrashOff } from "react-icons/tb";
import { GrClose, GrCheckmark } from "react-icons/gr";
import { MdOutlineDoneOutline, MdOutlineCancel } from "react-icons/md";
import useCustomError from "../../helper/hooks/useCustomError";
import { createNotification } from "../../helper/helper";
import { UITextContext } from "../TranslationWrapper";
import { GET_DELETEDUSERS, GET_VALIDUSERS } from "../../queries/userQueries";

export default function ProductUserModal({
  bind = "product",
  iconMode = false,
  itemIdsNamesToProcess,
  modalType = "Delete",
  areThereMultipleProducts = false,
  deleteBTNClass = "btn btn-danger p-2 ms-1 me-2 mb-2",
  handleShow,
  didItemComeFromItself = false, // true if the data came from a product card and not from the ProductsValid or ProductsDeleted page
  modalTitle,
  modalText,
  modalButtonText, // show modal and accept buttons too
  modalCloseButtonText,
  redirectPathAfterSuccess = null, // path to redirect after a successful modification (delete or restore)
}) {
  // const [getValidProducts, { data: validProducts_data }] =
  //   useLazyQuery(GET_VALIDPRODUCTS);
  // const [getDeletedProducts, { data: deletedProducts_data }] =
  //   useLazyQuery(GET_DELETEDPRODUCTS);

  const darkMode = useContext(DarkModeContext);

  const UIText = useContext(UITextContext);

  const navigate = useNavigate();

  const [handleCustomError] = useCustomError();

  const [show, setShow] = useState(false);

  const [showBTNLoadingSpinner, setShowBTNLoadingSpinner] = useState(false);

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [GET_VALIDPRODUCTS, GET_DELETEDPRODUCTS],
    // update(cache, { data: { deleteProduct } }) {
    //   var { validProducts } = cache.readQuery({
    //     query: GET_VALIDPRODUCTS,
    //   });

    //   cache.writeQuery({
    //     query: GET_VALIDPRODUCTS,
    //     data: {
    //       validProducts: validProducts.filter(
    //         (product) => product.id !== deleteProduct.id
    //       ),
    //     },
    //   });

    //   var { deletedProducts } = cache.readQuery({
    //     query: GET_DELETEDPRODUCTS,
    //   });

    //   cache.writeQuery({
    //     query: GET_DELETEDPRODUCTS,
    //     data: {
    //       deletedProducts: [...deletedProducts, deleteProduct],
    //     },
    //   });
    // },
  });

  const [removeProduct] = useMutation(REMOVE_PRODUCT, {
    // refetchQueries: [{ query: GET_DELETEDPRODUCTS }],
    update(cache, { data: { removeProduct } }) {
      // console.log(removedProduct);
      // read the GET_DELETEDPRODUCTS cashed query
      const { deletedProducts } = cache.readQuery({
        query: GET_DELETEDPRODUCTS,
      });
      // remove the deleted value from it
      cache.writeQuery({
        query: GET_DELETEDPRODUCTS,
        data: {
          deletedProducts: deletedProducts.filter(
            (product) => product.id !== removeProduct.id
          ),
        },
      });
    },
  });
  const [restoreDeletedProduct] = useMutation(RESTOREDELETED_PRODUCT, {
    refetchQueries: [GET_VALIDPRODUCTS, GET_DELETEDPRODUCTS],
  });

  const [deleteUser] = useMutation(DELETE_USER, {
    refetchQueries: [GET_VALIDUSERS, GET_DELETEDUSERS],
  });

  const [removeUser] = useMutation(REMOVE_USER, {
    refetchQueries: [{ query: GET_DELETEDUSERS }],
    // TODO: update method below would be better
    // update(cache, { data: { removeUser } }) {
    //   // console.log(removedProduct);
    //   // read the GET_DELETEDPRODUCTS cashed query
    //   const { deletedUsers } = cache.readQuery({
    //     query: GET_DELETEDUSERS,
    //   });
    //   // remove the deleted value from it
    //   cache.writeQuery({
    //     query: GET_DELETEDUSERS,
    //     data: {
    //       deletedUsers: deletedUsers.filter(
    //         (user) => user.id !== removeUser.id
    //       ),
    //     },
    //   });
    // },
  });
  const [restoreUser] = useMutation(RESTORE_USER, {
    refetchQueries: [GET_VALIDUSERS, GET_DELETEDUSERS],
  });

  const handleClick = async (e) => {
    e.preventDefault();
    setShowBTNLoadingSpinner(true);
    if (bind === "product") {
      if (modalType === "Delete") {
        //console.log("items to delete BEFORE delete:", itemIdsNamesToProcess);
        for (const item of itemIdsNamesToProcess) {
          try {
            await deleteProduct({ variables: { id: item[0] } });
            createNotification({
              title: UIText.successfulOperation,
              message: `${item[1]} ${UIText.successfullyDeleted}`,
              type: "success",
            });
          } catch (err) {
            handleCustomError(err);
          }
        }
        // itemIdsNamesToProcess.forEach((item) => {
        //   deleteProduct({ variables: { id: item[0] } })
        //     .then()
        //     .cache((err) => console.log(err));
        // });
      } else if (modalType === "Restore") {
        for (const item of itemIdsNamesToProcess) {
          try {
            await restoreDeletedProduct({ variables: { id: item[0] } });
            createNotification({
              title: UIText.successfulOperation,
              message: `${item[1]} ${UIText.successfullyRestored}`,
              type: "success",
            });
          } catch (err) {
            handleCustomError(err);
          }
        }
        // itemIdsNamesToProcess.forEach((item) => {
        //   restoreDeletedProduct({ variables: { id: item[0] } });
        //   // .then()
        //   // .cache((err) => console.log(err));
        // });
      } else if (modalType === "Remove") {
        for (const item of itemIdsNamesToProcess) {
          try {
            await removeProduct({ variables: { id: item[0] } });
            createNotification({
              title: UIText.successfulOperation,
              message: `${item[1]} ${UIText.successfullyRemoved}`,
              type: "success",
            });
          } catch (err) {
            handleCustomError(err);
          }
        }
        // itemIdsNamesToProcess.forEach((item) => {
        //   removeProduct({ variables: { id: item[0] } });
        //   // .then()
        //   // .cache((err) => console.log(err));
        // });
      }
    } else {
      if (modalType === "Delete") {
        //console.log("items to delete BEFORE delete:", itemIdsNamesToProcess);
        for (const item of itemIdsNamesToProcess) {
          try {
            await deleteUser({ variables: { id: item[0] } });
            createNotification({
              title: UIText.successfulOperation,
              message: `${item[1]} ${UIText.successfullyDeleted}`,
              type: "success",
            });
          } catch (err) {
            handleCustomError(err);
          }
        }
        // itemIdsNamesToProcess.forEach((item) => {
        //   deleteProduct({ variables: { id: item[0] } })
        //     .then()
        //     .cache((err) => console.log(err));
        // });
      } else if (modalType === "Restore") {
        for (const item of itemIdsNamesToProcess) {
          try {
            await restoreUser({ variables: { id: item[0] } });
            createNotification({
              title: UIText.successfulOperation,
              message: `${item[1]} ${UIText.successfullyRestored}`,
              type: "success",
            });
          } catch (err) {
            handleCustomError(err);
          }
        }
        // itemIdsNamesToProcess.forEach((item) => {
        //   restoreDeletedProduct({ variables: { id: item[0] } });
        //   // .then()
        //   // .cache((err) => console.log(err));
        // });
      } else if (modalType === "Remove") {
        for (const item of itemIdsNamesToProcess) {
          try {
            await removeUser({ variables: { id: item[0] } });
            createNotification({
              title: UIText.successfulOperation,
              message: `${item[1]} ${UIText.successfullyRemoved}`,
              type: "success",
            });
          } catch (err) {
            handleCustomError(err);
          }
        }
        // itemIdsNamesToProcess.forEach((item) => {
        //   removeProduct({ variables: { id: item[0] } });
        //   // .then()
        //   // .cache((err) => console.log(err));
        // });
      }
    }

    if (!didItemComeFromItself) {
      handleShow();
    }
    setShowBTNLoadingSpinner(false);
    setShow(false);
    if (redirectPathAfterSuccess) {
      navigate(redirectPathAfterSuccess, { replace: true });
    }
  };

  return (
    <span
      onDoubleClick={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        className={
          modalType === "Restore"
            ? deleteBTNClass.replace("btn-danger", "btn-primary")
            : deleteBTNClass
        }
        onClick={() => setShow(true)}
      >
        {iconMode ? (
          (modalType === "Delete" && (
            <TbTrash style={{ fontSize: "1.6rem" }} />
          )) ||
          (modalType === "Remove" && (
            <TbTrash style={{ fontSize: "1.6rem" }} />
          )) ||
          (modalType === "Restore" && (
            <TbTrashOff style={{ fontSize: "1.6rem" }} />
          ))
        ) : (
          <div>{modalButtonText}</div>
        )}
      </Button>

      <Modal
        show={show}
        onHide={() => setShow(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header
          closeButton={showBTNLoadingSpinner ? false : true}
          className={darkMode && "bg-dark text-white"}
        >
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode && "bg-dark text-white"}>
          <h3>{modalText}</h3>
          {itemIdsNamesToProcess?.map((item) => {
            return (
              <div key={item[0]} className="h5">
                <span style={{ color: "red" }}>{item[1]}</span>{" "}
                <span>({item[2]})</span>
              </div>
            );
          })}
        </Modal.Body>
        <Modal.Footer className={darkMode && "bg-dark text-white"}>
          <Button
            variant="secondary"
            onClick={() => setShow(false)}
            className={showBTNLoadingSpinner && "disabled"}
          >
            {iconMode ? (
              <MdOutlineCancel style={{ fontSize: "1.6rem" }} />
            ) : (
              modalCloseButtonText
            )}
          </Button>
          <Button
            variant={modalType === "Restore" ? "primary" : "danger"}
            onClick={handleClick}
          >
            {showBTNLoadingSpinner ? (
              <div className="text-center d-flex spinnerbox-customsize">
                <div className="text-center align-self-center spinner-border spinner-customsize"></div>
              </div>
            ) : iconMode ? (
              <MdOutlineDoneOutline style={{ fontSize: "1.6rem" }} />
            ) : (
              modalButtonText
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </span>
  );
}
