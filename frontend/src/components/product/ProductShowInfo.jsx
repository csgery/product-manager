import React, { useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useLazyQuery } from "@apollo/client";
import { GET_USER } from "../../queries/userQueries";
import { MdOutlineDoneOutline, MdOutlineCancel } from "react-icons/md";
import { useState } from "react";
import { GET_PRODUCT } from "../../queries/productQueries";
import { Button, Modal } from "react-bootstrap";
import SpinnerCustom from "../SpinnerCustom";
import ProductEditForm from "./ProductEditForm";
import moment from "moment";
import ProductUserModal from "../modals/ProductUserModal";
import { UITextContext } from "../TranslationWrapper";
import { TbEdit } from "react-icons/tb";
import { IconModeContext, DarkModeContext } from "../../App";
import { auth, defaultProductIMGPath } from "../../helper/helper";
import useCustomError from "../../helper/hooks/useCustomError";

export default function ProductShowInfo() {
  const [toggleEditForm, setToggleEditForm] = useState(false);
  const [showIMGZoomModal, setShowIMGZoomModal] = useState(false);

  const [handleCustomError] = useCustomError();
  const UIText = useContext(UITextContext);
  const iconMode = useContext(IconModeContext);
  const darkMode = useContext(DarkModeContext);

  const { id } = useParams();

  const { loading, error, data } = useQuery(GET_PRODUCT, {
    variables: { id },
  });
  const [
    getCreatorUser,
    {
      loading: creatorUserLoading,
      error: creatorUserError,
      data: creatorUserData,
    },
  ] = useLazyQuery(GET_USER);
  const [
    getEditorUser,
    {
      loading: editorUserLoading,
      error: editorUserError,
      data: editorUserData,
    },
  ] = useLazyQuery(GET_USER);

  useEffect(() => {
    if (data?.product.createdBy) {
      console.log("data.product.createdBy:", data.product.createdBy);
      getCreatorUser({ variables: { id: data.product.createdBy } });
    }
    if (data?.product.updatedBy) {
      console.log("data.product.updatedBy:", data.product.updatedBy);
      getEditorUser({ variables: { id: data.product.updatedBy } });
    }
  }, [data?.product.createdBy, data?.product.updatedBy]);

  if (loading) return <SpinnerCustom />;

  if (error) {
    handleCustomError(error);
  }

  const handleFormToggle = (e) => {
    setToggleEditForm(!toggleEditForm);
    //editFormRef.current?.focus();
  };

  // if the product is valid than return that product (it needs to avoid an expoit:
  // you have validproducts reading rights, so you can read products/ID
  // and you dont have invalidproducts reading right, so you CANT read products/deleted/ID
  // BUT there was an exploit: if you copy the deletedProduct ID and use product/ID, you can read the deleted product with validproducts reading right...)
  if (data && data?.product?.valid) {
    return (
      <>
        {console.log("data:", data)}
        {!loading && !error && data && (
          <>
            {" "}
            {/* 'card mx-1 px-01 mb-2 product' */}
            <div
              className={
                (!data.product.valid ? "deletedProduct-card " : "") +
                "card mx-auto w-50 px-1 mt-4 "
              }
              style={{ width: "18rem" }}
            >
              <div className="mt-2 text-center">
                <img
                  id="imgFrame"
                  src={
                    data.product.image || "../../../" + defaultProductIMGPath
                  }
                  className="img-fluid mb-2 align-self-center justify-content-center text-center"
                  style={{ maxWidth: "500px" }}
                  onDoubleClick={
                    data.product.image
                      ? () => setShowIMGZoomModal(true)
                      : () => {}
                  }
                />
              </div>

              <div className="card-body ">
                <h5 className="card-title">
                  <div>
                    <Link to={-1} className="mt-3 h6">
                      Go Back
                    </Link>
                  </div>
                  <div className="mt-3 h5">Name: {data.product.name}</div>
                </h5>

                <p className="card-text mt-1 mb-0 pt-1">
                  Short ID: {data.product.shortId}
                </p>
                <p className="card-text mt-1 mb-0 pt-1">
                  Quantity: {data.product.quantity}
                </p>
                <p className="card-text mt-1 mb-0 pt-1">
                  Description: {data.product.description || "-"}
                </p>
                <div className="product-admin-info">
                  <p className="card-text mt-1 mb-0 pt-1">
                    Created By:{" "}
                    {creatorUserData ? creatorUserData.user.username : "Hidden"}
                  </p>
                  <p className="card-text mt-1 mb-0 pt-1">
                    Created At:{" "}
                    {moment(data.product.createdAt).toLocaleString()}
                    {/* {new Date(data.product.createdAt).toISOString()} */}
                  </p>
                  {data.product.createdAt !== data.product.updatedAt && (
                    <>
                      <p className="card-text mt-1 mb-0 pt-1">
                        Last Updated By:{" "}
                        {editorUserData
                          ? editorUserData.user.username
                          : "Hidden"}
                        {/* if there is no right to read this than show Hidden, if
                      there is no last editor than show - */}
                      </p>
                      <p className="card-text mt-1 mb-0 pt-1">
                        Last Updated At:{" "}
                        {/* {new Date(data.product.updatedAt).toISOString()} */}
                        {moment(data.product.updatedAt).toLocaleString()}
                      </p>
                    </>
                  )}
                </div>

                {!toggleEditForm && (
                  <div className="mt-2">
                    {auth.isSet(auth.PERMS.update_product) && (
                      <Button
                        className="btn btn-dark me-1 mb-2 "
                        onClick={handleFormToggle}
                      >
                        {iconMode ? (
                          <TbEdit
                            style={{ fontSize: "1.6rem" }}
                            //className="btn btn-light"
                          />
                        ) : (
                          UIText.editButtonText
                        )}
                      </Button>
                    )}

                    {/* delete form */}
                    {auth.isSet(auth.PERMS.delete_product) && (
                      <ProductUserModal
                        bind="product"
                        iconMode={iconMode}
                        itemIdsNamesToProcess={[
                          [
                            data.product.id,
                            data.product.name,
                            data.product.shortId,
                          ],
                        ]}
                        didItemComeFromItself={true}
                        redirectPathAfterSuccess={"/products/"}
                        areThereMultipleProducts={false}
                        modalType="Delete"
                        deleteBTNClass={"btn btn-danger p-2 ms-1 me-2 mb-2 "}
                        modalTitle={UIText.deleteProductTitle}
                        modalText={UIText.deleteProductText}
                        modalButtonText={UIText.deleteButtonText}
                        modalCloseButtonText={UIText.closeButtonText}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
            {toggleEditForm && (
              <ProductEditForm
                product={data.product}
                setToggleEditForm={setToggleEditForm}
                iconMode={iconMode}
              />
            )}
            <Modal
              show={showIMGZoomModal}
              onHide={() => setShowIMGZoomModal(false)}
              size="xl"
            >
              <Modal.Header
                closeButton
                className={darkMode && "bg-dark text-white"}
              >
                <Modal.Title></Modal.Title>
              </Modal.Header>
              <Modal.Body className={darkMode && "bg-dark text-white"}>
                <div className="mt-2 text-center">
                  <img
                    id="imgFrame"
                    src={
                      data.product.image || "../../../" + defaultProductIMGPath
                    }
                    className="img-fluid mb-2 align-self-center justify-content-center text-center"
                    //style={{ maxWidth: "500px" }}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer className={darkMode && "bg-dark text-white"}>
                <Button
                  variant="danger"
                  onClick={() => setShowIMGZoomModal(false)}
                >
                  {iconMode ? (
                    <MdOutlineCancel style={{ fontSize: "1.6rem" }} />
                  ) : (
                    UIText.closeButtonText
                  )}
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        )}
      </>
    );
  } else return <>Product Not Found</>;
}
