import React from "react";
import { useState, useEffect, useRef, useContext } from "react";
import { useMutation } from "@apollo/client";
import { GET_PRODUCT, GET_VALIDPRODUCTS } from "../queries/productQueries";
import { UPDATE_PRODUCT } from "../mutations/productMutations";
import { Store } from "react-notifications-component";
import { getErrorMessageCode } from "../helper/helper";
import { UITextContext } from "./TranslationWrapper";
import { GrClose, GrCheckmark } from "react-icons/gr";
import { MdOutlineDoneOutline, MdOutlineCancel } from "react-icons/md";

const ProductEditForm = ({ product, setToggleEditForm, iconMode }) => {
  const [name, setName] = useState(product.name);
  const [shortId, setShortId] = useState(product.shortId);
  const [quantity, setQuantity] = useState(product.quantity);

  const UIText = useContext(UITextContext);

  const [updateProject] = useMutation(UPDATE_PRODUCT, {
    variables: { id: product.id, name, shortId, quantity },
    // in order to refresh the data on the screen after update
    refetchQueries: [{ query: GET_VALIDPRODUCTS }],
  });

  useEffect(() => {
    focus();
  }, []);

  const focusRef = useRef(null);
  const inputNameRef = useRef(null);
  const inputShortIdRef = useRef(null);
  const inputQuantityRef = useRef(null);

  const createNotification = ({ title, message, type }) => {
    Store.addNotification({
      title: title,
      message: message,
      type: type,
      insert: "top",
      container: "top-right",
      animationIn: ["animate__animated", "animate__fadeIn"],
      animationOut: ["animate__animated", "animate__fadeOut"],
      dismiss: {
        duration: 5000,
        onScreen: true,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name === "" || shortId === "" || quantity < 1) {
      // error = true;
      return createNotification({
        title: "Failed To Update!",
        message: "Please fill out all fields!",
        type: "danger",
      });
    }

    if (quantity > 1000) {
      return createNotification({
        title: "Failed To Update!",
        message: "Quantity is larger than 1000",
        type: "danger",
      });
    }

    updateProject(name, shortId, quantity)
      .then(() => {
        // successful notification message
        createNotification({
          title: "Successful Update!",
          message: "Product Successfully Updated",
          type: "success",
        });

        // close modification form
        setToggleEditForm(false);
      })
      .catch((err) => {
        const { message, code } = getErrorMessageCode(err.message);
        // error notification message
        console.log(err);
        console.log("err.message", message);
        console.log("err.extensions", err.extensions);
        console.log("err.code", code);
        if (code === "EXISTED_SHORTID") {
          err.message = message;
        }
        createNotification({
          title: "Failed To Update!",
          message: err.message,
          type: "danger",
        });
        // throw err;
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
      Number(quantity) === product.quantity
    ) {
      return true;
    }
    return false;
  };

  return (
    <div className="mt-4 mb-4 w-75 mx-auto">
      <h3>{UIText.productFormTitle}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">{UIText.name}</label>
          <input
            ref={focusRef}
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">{UIText.shortID}</label>
          <input
            type="text"
            className="form-control"
            id="shortId"
            value={shortId}
            onChange={(e) => setShortId(e.target.value)}
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
        >
          {iconMode ? (
            <MdOutlineDoneOutline style={{ fontSize: "1.6rem" }} />
          ) : (
            UIText.editButtonText
          )}
        </button>
      </form>
    </div>
  );
};

export default ProductEditForm;
