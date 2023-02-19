import React from "react";
import { useState, useEffect, useRef, useContext } from "react";
import { useMutation } from "@apollo/client";
import { GET_VALIDPRODUCTS } from "../../queries/productQueries";
import { UPDATE_PRODUCT } from "../../mutations/productMutations";
import {
  createNotification,
  validateProductInput,
  defaultProductIMGPath as defaultImage,
  imageMaxSize,
  imageSupportedFileTypes,
} from "../../helper/helper";
import useCustomError from "../../helper/hooks/useCustomError";
import { UITextContext } from "../TranslationWrapper";
import { MdOutlineDoneOutline, MdOutlineCancel } from "react-icons/md";

const ProductEditForm = ({ product, setToggleEditForm, iconMode }) => {
  const defaultProductIMGPath = "../../" + defaultImage;

  const [name, setName] = useState(product.name);
  const [shortId, setShortId] = useState(product.shortId);
  const [quantity, setQuantity] = useState(product.quantity);
  const [description, setDescription] = useState(product.description || "");
  const [IMGFrame, setIMGFrame] = useState(
    product.image || defaultProductIMGPath
  );
  const [IMGBase64, setIMGBase64] = useState(product.image);

  const [handleCustomError] = useCustomError();

  const UIText = useContext(UITextContext);

  const [updateProject] = useMutation(UPDATE_PRODUCT, {
    // in order to refresh the data on the screen after update
    refetchQueries: [{ query: GET_VALIDPRODUCTS }],
  });

  useEffect(() => {
    focus();
  }, []);

  const focusRef = useRef(null);

  const handleInputChange = (value, setStateCallback) => {
    value = validateProductInput(value, UIText);
    setStateCallback(value);
  };

  const handleIMGChange = (e) => {
    // check file size
    // size in byte
    if (e.target.files[0].size > imageMaxSize) {
      createNotification({
        title: UIText.error,
        message: `${UIText.imageTooLarge} ${imageMaxSize} B`,
        type: "warning",
      });
      //clearIMG();
      return;
    }
    if (!imageSupportedFileTypes.includes(e.target.files[0].type)) {
      createNotification({
        title: UIText.error,
        message:
          UIText.imageNotSupportedType +
          imageSupportedFileTypes
            .split(",")
            .map((fileType) => " " + fileType.split("/")[1]),
        type: "warning",
      });
      //clearIMGInput();
      return;
    }
    previewIMG(e);
    convertToBase64(e);
  };
  const clearIMG = () => {
    document.getElementById("formFile").value = null;
    setIMGFrame(defaultProductIMGPath);
    setIMGBase64("");
  };

  const cancelIMG = () => {
    document.getElementById("formFile").value = null;
    setIMGFrame(product.image || defaultProductIMGPath);
    setIMGBase64(product.image);
  };

  const previewIMG = (e) => {
    setIMGFrame(URL.createObjectURL(e.target.files[0]));
  };

  const convertToBase64 = (e) => {
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);

    reader.onload = () => {
      setIMGBase64(reader.result);
    };
    reader.onerror = (error) => {
      createNotification({
        title: UIText.error,
        message: `${UIText.pleaseTryAgainLater}\nError: ${error}`,
        type: "danger",
      });
      //console.log("Error: ", error);
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name === "" || shortId === "" || quantity < 1) {
      // error = true;
      return createNotification({
        title: UIText.warning,
        message: UIText.fillOutAllField,
        type: "warning",
      });
    }

    if (quantity > 1000) {
      return createNotification({
        title: UIText.error,
        message: UIText.quantityTooLarge,
        type: "danger",
      });
    }
    console.log(description);
    updateProject({
      variables: {
        id: product.id,
        name,
        shortId,
        quantity,
        description,
        image: IMGBase64,
      },
    })
      .then(() => {
        // successful notification message
        createNotification({
          title: UIText.successfulOperation,
          message: UIText.successfullyUpdated,
          type: "success",
        });

        // close modification form
        setToggleEditForm(false);
      })
      .catch((err) => {
        handleCustomError(err);
      });
  };

  const focus = () => {
    //focusRef.current.focus();
    focusRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEditBTNDisabling = () => {
    if (
      name === product.name &&
      shortId === product.shortId &&
      Number(quantity) === product.quantity &&
      description === product.description &&
      product.image === IMGBase64
    ) {
      return true;
    }
    return false;
  };

  return (
    <div className="mt-4 mb-4 w-75 mx-auto">
      <h3>{UIText.productFormTitle}</h3>
      <div /*onSubmit={handleSubmit}*/>
        <div className="mb-5 text-center">
          <img
            id="imgFrame"
            src={IMGFrame}
            className="img-fluid"
            style={{ maxWidth: "600px" }}
          />
          <div className="mb-2 mt-2 text-center">
            <button
              onClick={clearIMG}
              className="btn btn-primary me-3"
              disabled={IMGBase64 === "" || IMGBase64 === null}
            >
              Clear IMG
            </button>
            <button
              onClick={cancelIMG}
              className="btn btn-primary "
              disabled={IMGBase64 === product.image}
            >
              Cancel IMG
            </button>
          </div>
          <input
            className="form-control"
            type="file"
            id="formFile"
            onChange={(e) => {
              handleIMGChange(e);
            }}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">{UIText.name}</label>
          <input
            ref={focusRef}
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => handleInputChange(e.target.value, setName)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">{UIText.shortID}</label>
          <input
            type="text"
            className="form-control"
            id="shortId"
            value={shortId}
            onChange={(e) => handleInputChange(e.target.value, setShortId)}
          ></input>
        </div>
        <div className="mb-3">
          <label className="form-label">{UIText.quantity}</label>
          <input
            type="number"
            id="quantity"
            className="form-select"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          ></input>
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
        <button
          type="button"
          className="btn btn-danger "
          onClick={() => setToggleEditForm(false)}
        >
          {iconMode ? (
            <MdOutlineCancel style={{ fontSize: "1.6rem" }} />
          ) : (
            UIText.cancelButtonText
          )}
        </button>
        <button
          type="submit"
          className="btn btn-primary ms-1 "
          disabled={handleEditBTNDisabling()}
          onClick={handleSubmit}
        >
          {iconMode ? (
            <MdOutlineDoneOutline style={{ fontSize: "1.6rem" }} />
          ) : (
            UIText.editButtonText
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductEditForm;
