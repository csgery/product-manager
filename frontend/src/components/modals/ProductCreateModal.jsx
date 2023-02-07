import { useState, useContext } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_PRODUCT } from "../../mutations/productMutations";
import { GET_VALIDPRODUCTS } from "../../queries/productQueries";
import { Button, Modal } from "react-bootstrap";
import useCustomError from "../../helper/hooks/useCustomError";
import { DarkModeContext } from "../../App";
import { GrAdd } from "react-icons/gr";
import { MdOutlineDoneOutline, MdOutlineCancel } from "react-icons/md";
import { createNotification } from "../../helper/helper";

import { UITextContext } from "../TranslationWrapper";
import { IconModeContext } from "../../App";
import { validateInput } from "../../helper/helper";

export default function ProductCreateModal() {
  const [name, setName] = useState("");
  const [shortId, setShortId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [show, setShow] = useState(false);

  const darkMode = useContext(DarkModeContext);
  const UIText = useContext(UITextContext);

  const [handleCustomError] = useCustomError();

  const iconMode = useContext(IconModeContext);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [addProduct, { data }] = useMutation(CREATE_PRODUCT, {
    variables: { name, shortId, quantity },
    update(cache, { data: { data } }) {
      const { validProducts } = cache.readQuery({ query: GET_VALIDPRODUCTS });
      console.log("addProduct:", addProduct);
      cache.writeQuery({
        query: GET_VALIDPRODUCTS,
        data: { validProducts: [...validProducts, addProduct] },
      });
    },
  });

  const handleInputChange = (value, setStateCallback) => {
    value = validateInput(value, UIText);
    setStateCallback(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name === "" || shortId === "" || quantity < 1 || quantity > 1000) {
      // error = true;
      return createNotification({
        title: UIText.warning,
        message: UIText.fillOutAllField,
        type: "warning",
      });
    }

    addProduct(name, shortId, quantity)
      .then(() => {
        setName("");
        setShortId("");
        setQuantity(0);
        handleClose();
        createNotification({
          title: UIText.successfulOperation,
          message: UIText.successfullyCreated,
          type: "success",
        });
      })
      .catch((err) => {
        handleCustomError(err);
      });
  };

  return (
    <>
      <Button className="btn btn-light p-2 ms-1 me-2 mb-2" onClick={handleShow}>
        {iconMode ? (
          <GrAdd style={{ fontSize: "1.6rem" }} />
        ) : (
          UIText.createProductButtonText
        )}
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton className={darkMode && "bg-dark text-white"}>
          <Modal.Title>{UIText.createProductButtonText}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode && "bg-dark text-white"}>
          <div className="mb-3">
            <label className="form-label">{UIText.name}</label>
            <input
              type="text"
              className="form-control"
              id="name"
              onChange={(e) => handleInputChange(e.target.value, setName)}
              value={name}
            />
          </div>
          <div className="mb-3 danger">
            <label className="form-label ">{UIText.shortID}</label>
            <input
              type="text"
              className="form-control"
              id="shortId"
              onChange={(e) => handleInputChange(e.target.value, setShortId)}
              value={shortId}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">{UIText.quantity}</label>
            <input
              type="number"
              className="form-control"
              id="quantity"
              onChange={(e) => setQuantity(Number(e.target.value))}
              value={quantity}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className={darkMode && "bg-dark text-white"}>
          <Button variant="danger" onClick={handleClose}>
            {iconMode ? (
              <MdOutlineCancel style={{ fontSize: "1.6rem" }} />
            ) : (
              UIText.closeButtonText
            )}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
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
