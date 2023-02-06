import { useState, useContext, useCallback, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_PRODUCT } from "../../mutations/productMutations";
import { GET_VALIDPRODUCTS } from "../../queries/productQueries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { handleCustomError } from "../../helper/helper";
import { RefreshTokenMutationContext } from "../../pages/TokenWrapper";
import { DarkModeContext, LangContext } from "../../App";
import { TbTrash, TbCirclePlus } from "react-icons/tb";
import { GrAdd } from "react-icons/gr";
import { GrClose, GrCheckmark } from "react-icons/gr";
import { MdOutlineDoneOutline, MdOutlineCancel } from "react-icons/md";

import { UITextContext } from "../TranslationWrapper";
import { IconModeContext } from "../../App";

export default function ProductCreateModal() {
  const [name, setName] = useState("");
  const [shortId, setShortId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [show, setShow] = useState(false);

  const getRefreshToken = useContext(RefreshTokenMutationContext);
  const darkMode = useContext(DarkModeContext);
  const UIText = useContext(UITextContext);

  const iconMode = useContext(IconModeContext);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const navigate = useNavigate();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    let error = false;

    console.log(name, shortId, quantity);

    if (name === "" || shortId === "" || quantity < 1 || quantity > 1000) {
      // error = true;
      return alert("Please fill out the fields");
    }
    // if (error) {
    //   console.log(error);
    //   return alert(error);
    // }

    addProduct(name, shortId, quantity)
      .then(() => {
        setName("");
        setShortId("");
        setQuantity(0);
        handleClose();
      })
      .catch((err) => {
        error = true;
        console.log(err);
        alert(err);
        handleCustomError(err, navigate, getRefreshToken);
      });

    // console.log("outside if");
    // console.log(error);
    // if (!error) {
    //   console.log("inside if");
    //   setName("");
    //   setShortId("");
    //   setQuantity(0);
    //   handleClose();
    // }

    // handleHide();
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
              defaultValue={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-3 danger">
            <label className="form-label ">{UIText.shortID}</label>
            <input
              type="text"
              className="form-control"
              id="shortId"
              defaultValue={shortId}
              onChange={(e) => setShortId(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">{UIText.quantity}</label>
            <input
              type="number"
              className="form-control"
              id="quantity"
              defaultValue={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
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

    // <>
    //   {/* Button trigger modal */}
    //   <button
    //     type="button"
    //     className="btn btn-light p-2 "
    //     data-bs-toggle="modal"
    //     data-bs-target="#createProductModal"
    //   >
    //     Create Product
    //   </button>

    //   {/* Modal */}
    //   <div
    //     className="modal fade"
    //     id="createProductModal"
    //     aria-labelledby="#createProductModalLabel"
    //     aria-hidden="true"
    //   >
    //     <div className="modal-dialog">
    //       <div className="modal-content">
    //         <div className="modal-header">
    //           <h1 className="modal-title fs-5" id="#createProductModalLabel">
    //             Create Product
    //           </h1>
    //           <button
    //             type="button"
    //             className="btn-close"
    //             data-bs-dismiss="modal"
    //             aria-label="Close"
    //           ></button>
    //         </div>
    //         <div className="modal-body">
    //           <form onSubmit={handleSubmit}>
    //             <div className="mb-3">
    //               <label className="form-label">Name</label>
    //               <input
    //                 type="text"
    //                 className="form-control"
    //                 id="name"
    //                 defaultValue={name}
    //                 onChange={(e) => setName(e.target.value)}
    //               />
    //             </div>
    //             <div className="mb-3">
    //               <label className="form-label">Short ID</label>
    //               <input
    //                 type="text"
    //                 className="form-control"
    //                 id="shortId"
    //                 defaultValue={shortId}
    //                 onChange={(e) => setShortId(e.target.value)}
    //               />
    //             </div>
    //             <div className="mb-3">
    //               <label className="form-label">Quantity</label>
    //               <input
    //                 type="number"
    //                 className="form-control"
    //                 id="quantity"
    //                 defaultValue={quantity}
    //                 onChange={(e) => setQuantity(Number(e.target.value))}
    //               />
    //             </div>
    //             {/*
    //             <input type="hidden" id="modalId" value={modalId} /> */}
    //             <button
    //               type="submit"
    //               // data-bs-dismiss="modal"
    //               className="btn btn-secondary"
    //             >
    //               Create
    //             </button>
    //           </form>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </>
  );
}
