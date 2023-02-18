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
import { validateProductInput } from "../../helper/helper";

export default function ProductCreateModal() {
  const defaultIMGPath = import.meta.env.VITE_PRODUCT_DEFAULTIMAGE;

  const [name, setName] = useState("");
  const [shortId, setShortId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [description, setDescription] = useState("");
  const [IMGFrame, setIMGFrame] = useState(defaultIMGPath);
  const [IMGBase64, setIMGBase64] = useState("");

  const [show, setShow] = useState(false);

  const darkMode = useContext(DarkModeContext);
  const UIText = useContext(UITextContext);

  const [handleCustomError] = useCustomError();

  const iconMode = useContext(IconModeContext);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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

    // if (IMGFrame === defaultIMGPath) {
    //   setIMGFrame("");
    // }

    // const img = document.getElementById("formFile");
    // encodeImageFileAsURL(img);
    // console.log("inside submit:", IMGBase64);
    // return;

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
        setName("");
        setShortId("");
        setQuantity(0);
        setDescription("");
        setIMGFrame(defaultIMGPath);
        setIMGBase64("");
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
    //const defaultIMGPath = import.meta.env.VITE_PRODUCT_DEFAULTIMAGE;
    document.getElementById("formFile").value = null;
    setIMGFrame(defaultIMGPath);
    setIMGBase64("");
    //imgFrame.src = defaultIMGPath;
  };

  const previewIMG = (e) => {
    setIMGFrame(URL.createObjectURL(e.target.files[0]));
    //imgFrame.src = URL.createObjectURL(e.target.files[0]);
  };

  function convertToBase64(e) {
    // check max. file size is not exceeded
    // size is in bytes
    console.log(e.target.files[0]);
    if (e.target.files[0] > 2000000) {
      console.log("File too large");
      return;
    }
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);

    reader.onload = () => {
      setIMGBase64(reader.result);
      console.log(reader.result); //base64encoded string
    };
    reader.onerror = (error) => {
      console.log("Error: ", error);
    };
  }

  return (
    <>
      <Button className="btn btn-light p-2 ms-1 me-2 mb-2" onClick={handleShow}>
        {iconMode ? (
          <GrAdd style={{ fontSize: "1.6rem" }} />
        ) : (
          UIText.createProductButtonText
        )}
      </Button>

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton className={darkMode && "bg-dark text-white"}>
          <Modal.Title>{UIText.createProductButtonText}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode && "bg-dark text-white"}>
          <div class="container col-md-6">
            <div class="mb-5">
              <img id="imgFrame" src={IMGFrame} class="img-fluid" />
              <button onClick={clearIMG} class="btn btn-primary mt-3">
                Clear IMG
              </button>
              <input
                class="form-control"
                type="file"
                id="formFile"
                onChange={(e) => {
                  previewIMG(e);
                  convertToBase64(e);
                }}
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
          <div class="form-group">
            <label className="form-label" for="description">
              {UIText.description}
            </label>
            <textarea
              className="form-control"
              id="description"
              rows="3"
              onChange={(e) => setDescription(e.target.value)}
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
