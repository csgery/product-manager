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
  GET_VALIDPRODUCTS,
  GET_DELETEDPRODUCTS,
} from "../../queries/productQueries";
import { handleCustomError } from "../../helper/helper";
import { useNavigate } from "react-router-dom";
import { RefreshTokenMutationContext } from "../../pages/TokenWrapper";
import { DarkModeContext, LangContext } from "../../App";
import { TbTrash, TbTrashOff } from "react-icons/tb";

export default function ProductUserModal({
  bind = "product",
  iconMode = false,
  itemIdsNamesToProcess,
  modalType = "Delete",
  areThereMultipleProducts = false,
  deleteBTNClass = "btn btn-danger p-2 ms-1 me-2 mb-2",
  handleShow,
  didProductComeFromItself = false, // true if the data came from a product card and not from the ProductsValid or ProductsDeleted page
  modalTitle,
  modalText,
  modalButtonText, // show modal and accept buttons too
  modalCloseButtonText,
  redirectPathAfterSuccess = null, // path to redirect after a successful modification (delete or restore)
}) {
  const [getValidProducts, { data: validProducts_data }] =
    useLazyQuery(GET_VALIDPRODUCTS);
  const [getDeletedProducts, { data: deletedProducts_data }] =
    useLazyQuery(GET_DELETEDPRODUCTS);

  const getRefreshToken = useContext(RefreshTokenMutationContext);
  const darkMode = useContext(DarkModeContext);

  const navigate = useNavigate();

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
    // update(cache, { data: { restoreDeletedProduct } }) {
    //   var { deletedProducts } = cache.readQuery({
    //     query: GET_DELETEDPRODUCTS,
    //   });
    //   cache.writeQuery({
    //     query: GET_DELETEDPRODUCTS,
    //     data: {
    //       deletedProducts: deletedProducts.filter(
    //         (product) => product.id !== restoreDeletedProduct.id
    //       ),
    //     },
    //   });
    //   var { validProducts } = cache.readQuery({
    //     query: GET_VALIDPRODUCTS,
    //   });
    //   cache.writeQuery({
    //     query: GET_VALIDPRODUCTS,
    //     data: {
    //       validProducts: [...validProducts, restoreDeletedProduct],
    //     },
    //   });
    // },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    setShowBTNLoadingSpinner(true);
    if (modalType === "Delete") {
      for (const item of itemIdsNamesToProcess) {
        try {
          await deleteProduct({ variables: { id: item[0] } });
        } catch (err) {
          handleCustomError(err, navigate, getRefreshToken);
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
        } catch (err) {
          handleCustomError(err, navigate, getRefreshToken);
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
        } catch (err) {
          handleCustomError(err, navigate, getRefreshToken);
        }
      }
      // itemIdsNamesToProcess.forEach((item) => {
      //   removeProduct({ variables: { id: item[0] } });
      //   // .then()
      //   // .cache((err) => console.log(err));
      // });
    }
    if (!didProductComeFromItself) {
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
            {modalCloseButtonText}
          </Button>
          <Button
            variant={modalType === "Restore" ? "primary" : "danger"}
            onClick={handleClick}
          >
            {showBTNLoadingSpinner ? (
              <div className="text-center d-flex spinnerbox-customsize">
                <div className="text-center align-self-center spinner-border spinner-customsize"></div>
              </div>
            ) : (
              modalButtonText
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </span>
  );
}
