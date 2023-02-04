import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";

export default function ProductModal({
  type = "create",
  iconMode = false,
  product,
}) {
  let modalId;
  let modalTitle;
  let modalShowButtonTitle;
  let modalSubmitButtonTitle;

  if (type === "update") {
    modalId = "updateProductModal";
    modalTitle = "Update Product";
    modalShowButtonTitle = "Update";
    modalSubmitButtonTitle = "Update";
  } else if (type === "create") {
    modalId = "createProductModal";
    modalTitle = "Create Product";
    modalShowButtonTitle = "Create";
    modalSubmitButtonTitle = "Create";
  }

  console.log("in ProductModal.jsx:" + product.shortId);

  return (
    <>
      {/* Button trigger modal */}
      <button
        type="button"
        className="btn btn-light p-2 "
        data-bs-toggle="modal"
        data-bs-target={"#" + modalId}
      >
        {iconMode ? (
          <FontAwesomeIcon
            icon={faPenToSquare}
            style={{ fontSize: "1.4rem" }}
          />
        ) : (
          <div className="d-flex align-items-center">
            <div>{modalShowButtonTitle}</div>
          </div>
        )}
      </button>

      {/* Modal */}
      <div
        className="modal fade"
        id={modalId}
        aria-labelledby="addClientModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="addClientModalLabel">
                {modalTitle}
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    defaultValue={type === "update" ? product.name : ""}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Short ID</label>
                  <input
                    type="text"
                    className="form-control"
                    id="email"
                    defaultValue={type === "update" ? product.shortId : ""}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-control" id="phone" />
                </div>

                <button
                  type="submit"
                  data-bs-dismiss="modal"
                  className="btn btn-secondary"
                >
                  {modalSubmitButtonTitle}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
