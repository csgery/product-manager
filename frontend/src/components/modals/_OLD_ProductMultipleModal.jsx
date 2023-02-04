import { useState } from "react";
import { useMutation } from "@apollo/client";
import { DELETE_PRODUCT } from "../../mutations/productMutations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { Button, Modal } from "react-bootstrap";
import { GET_VALIDPRODUCTS } from "../../queries/productQueries";

export default function ProductMultipleModal({
  iconMode = false,
  idsNamesToDelete,
  deleteBTNClass,
  handleShow,
}) {
  // let modalTitle;
  // let modalButtonTitle;

  // if (bind === "product") {
  //   modalTitle = "Delete Product";
  //   modalButtonTitle = "Delete";
  // } else if (bind === "user") {
  //   modalTitle = "Delete User";
  //   modalButtonTitle = "Delete";
  // }
  const [show, setShow] = useState(false);

  const [deleteProduct, { data }] = useMutation(DELETE_PRODUCT, {
    update(cache, { data: data }) {
      const { validProducts } = cache.readQuery({
        query: { GET_PRODUCTS, GET_VALIDPRODUCTS },
      });
      cache.writeQuery({
        query: { GET_PRODUCTS, GET_VALIDPRODUCTS },
        data: {
          validProducts: validProducts.filter((product) => product.id !== data),
        },
      });
    },
  });

  const handleDelete = (e) => {
    e.preventDefault();
    idsNamesToDelete.forEach((item) => {
      deleteProduct({ variables: { id: item[0] } });
      // .then()
      // .cache((err) => console.log(err));
    });
    handleShow();
    setShow(false);
  };

  return (
    <>
      <Button className={deleteBTNClass} onClick={() => setShow(true)}>
        Delete
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Multiple Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h3>Are you sure to delete the following produts permanently?</h3>
          {idsNamesToDelete.map((item) => {
            return (
              <div key={item[0]} className="h5">
                <span style={{ color: "red" }}>{item[1]}</span>{" "}
                <span>({item[2]})</span>
              </div>
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete All
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
