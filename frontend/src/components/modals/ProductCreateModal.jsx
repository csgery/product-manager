import { useState, useContext, useRef } from "react";
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
import {
  validateProductInput,
  defaultProductIMGPath,
  handleIMGChange,
} from "../../helper/helper";

export default function ProductCreateModal() {
  // const defaultProductIMGPath = import.meta.env.VITE_PRODUCT_DEFAULTIMAGE;
  // const imageMaxSize = import.meta.env.VITE_IMAGE_MAXSIZE;
  // const imageSupportedFileTypes = import.meta.env.VITE_IMAGE_SUPPORTEDFILETYPES;

  const [name, setName] = useState("");
  const [shortId, setShortId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [description, setDescription] = useState("");
  const [IMGFrame, setIMGFrame] = useState(defaultProductIMGPath);
  const [IMGBase64, setIMGBase64] = useState("");

  const [show, setShow] = useState(false);

  const darkMode = useContext(DarkModeContext);
  const UIText = useContext(UITextContext);

  const [handleCustomError] = useCustomError();

  const iconMode = useContext(IconModeContext);

  const imgInputRef = useRef(null);

  const handleClose = () => {
    setName("");
    setShortId("");
    setQuantity(0);
    setDescription("");
    setIMGFrame(defaultProductIMGPath);
    setIMGBase64("");
    setShow(false);
  };

  const [addProduct, { data }] = useMutation(CREATE_PRODUCT, {
    update(cache, { data: { data } }) {
      const { validProducts } = cache.readQuery({ query: GET_VALIDPRODUCTS });
      //console.log("addProduct:", addProduct);
      cache.writeQuery({
        query: GET_VALIDPRODUCTS,
        data: { validProducts: [...validProducts, addProduct] },
      });
    },
  });

  const handleInputChange = (value, setStateCallback) => {
    value = validateProductInput(value, UIText);
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
    console.log(IMGBase64);
    addProduct({
      variables: { name, shortId, quantity, description, image: IMGBase64 },
    })
      .then(() => {
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

  const clearIMG = () => {
    document.getElementById("formFile").value = null;
    setIMGFrame(defaultProductIMGPath);
    setIMGBase64("");
  };

  const previewIMG = (e) => {
    setIMGFrame(URL.createObjectURL(e.target.files[0]));
  };

  const handleIMGDrop = (e) => {
    e.preventDefault();
    e.target.files = e.dataTransfer.files;
    const successfulIMGChange = handleIMGChange(
      e,
      previewIMG,
      setIMGBase64,
      imgInputRef,
      UIText
    );
    if (successfulIMGChange) {
      console.log(imgInputRef);
      imgInputRef.current.files = e.dataTransfer.files;
    }
  };

  return (
    <>
      <Button
        className="btn btn-light p-2 ms-1 me-2 mb-2"
        onClick={() => setShow(true)}
      >
        {iconMode ? (
          <GrAdd style={{ fontSize: "1.6rem" }} />
        ) : (
          UIText.createProductButtonText
        )}
      </Button>

      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Modal.Header closeButton className={darkMode && "bg-dark text-white"}>
          <Modal.Title>{UIText.createProductButtonText}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode && "bg-dark text-white"}>
          <div className="container col-md-6">
            <div className="mb-5">
              <img
                id="imgFrame"
                src={IMGFrame}
                className="img-fluid"
                onDrop={(e) => handleIMGDrop(e)}
                onDragOver={(e) => e.preventDefault()}
              />
              <button onClick={clearIMG} className="btn btn-primary mt-3">
                Clear IMG
              </button>
              <input
                className="form-control"
                type="file"
                id="formFile"
                onChange={(e) => {
                  handleIMGChange(
                    e,
                    previewIMG,
                    setIMGBase64,
                    imgInputRef,
                    UIText
                  );
                }}
                ref={imgInputRef}
              />
            </div>
          </div>

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
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              {UIText.description}
            </label>
            <textarea
              className="form-control"
              id="description"
              rows="3"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            ></textarea>
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
