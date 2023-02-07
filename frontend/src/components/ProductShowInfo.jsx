import React, { createRef, useRef, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useLazyQuery } from "@apollo/client";
import { GET_USER } from "../queries/userQueries";
import { useState } from "react";
import { GET_PRODUCT } from "../queries/productQueries";
import Spinner from "./Spinner";
import ProductEditForm from "./ProductEditForm";
import ProductDeleteModal from "./modals/ProductUserModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import moment from "moment";
import ProductUserModal from "./modals/ProductUserModal";
import { UITextContext } from "./TranslationWrapper";
import { TbEdit } from "react-icons/tb";
import { Button, Modal } from "react-bootstrap";
import { IconModeContext } from "../App";

export default function ProductShowInfo() {
  const [toggleEditForm, setToggleEditForm] = useState(false);

  const UIText = useContext(UITextContext);
  const iconMode = useContext(IconModeContext);

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
    } else if (data?.product.updatedBy) {
      console.log("data.product.updatedBy:", data.product.updatedBy);
      getEditorUser({ variables: { id: data.product.updatedBy } });
    }
  }, [data?.product.createdBy, data?.product.updatedBy]);

  if (loading) return <Spinner />;

  if (error /*|| userError*/)
    return (
      <p>Something Went Wrong {error?.message /*, userError?.message*/}</p>
    );

  const handleFormToggle = (e) => {
    setToggleEditForm(!toggleEditForm);
    //editFormRef.current?.focus();
  };

  // if (!loading && !error && data) {
  //   getUser({ variables: { id: data.product.createdBy } });
  // }

  // console.log("product:", data.product);
  // console.log("userData:", userData);
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
              "card mx-auto w-75 px-1 mt-4 "
            }
            style={{ width: "18rem" }}
          >
            <div className="card-body">
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
                Description: {data.product.description}
              </p>
              <div className="product-admin-info">
                <p className="card-text mt-1 mb-0 pt-1">
                  Created By:{" "}
                  {creatorUserData ? creatorUserData.user.username : "Hidden"}
                </p>
                <p className="card-text mt-1 mb-0 pt-1">
                  Created At: {new Date(data.product.createdAt).toISOString()}
                </p>
                {data.product.createdAt !== data.product.updatedAt && (
                  <>
                    <p className="card-text mt-1 mb-0 pt-1">
                      Last Updated By:{" "}
                      {editorUserData ? editorUserData.user.username : "Hidden"}
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
                  {data.product.valid && (
                    <>
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
                      {/* delete form */}
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
                        didProductComeFromItself={true}
                        redirectPathAfterSuccess={"/products/"}
                        areThereMultipleProducts={false}
                        modalType="Delete"
                        deleteBTNClass={"btn btn-danger p-2 ms-1 me-2 mb-2 "}
                        modalTitle={UIText.deleteProductTitle}
                        modalText={UIText.deleteProductText}
                        modalButtonText={UIText.deleteButtonText}
                        modalCloseButtonText={UIText.closeButtonText}
                      />
                    </>
                  )}
                  {!data.product.valid && (
                    <>
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
                        didProductComeFromItself={true}
                        redirectPathAfterSuccess={"/products/deleted"}
                        areThereMultipleProducts={false}
                        modalType="Remove"
                        deleteBTNClass={"btn btn-danger p-2 me-2 mb-2 mt-2 "}
                        modalTitle={UIText.removeProductTitle}
                        modalText={UIText.removeProductText}
                        modalButtonText={UIText.removeButtonText}
                        modalCloseButtonText={UIText.closeButtonText}
                      />
                      {/* restore form */}
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
                        didProductComeFromItself={true}
                        redirectPathAfterSuccess={"/products/deleted"}
                        areThereMultipleProducts={false}
                        modalType="Restore"
                        deleteBTNClass={
                          "btn btn-primary p-2 ms-1 me-2 mb-2 mt-2 "
                        }
                        modalTitle={UIText.restoreProductTitle}
                        modalText={UIText.restoreProductText}
                        modalButtonText={UIText.restoreButtonText}
                        modalCloseButtonText={UIText.closeButtonText}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          {data.product.valid && toggleEditForm && (
            <ProductEditForm
              product={data.product}
              setToggleEditForm={setToggleEditForm}
              iconMode={iconMode}
            />
          )}
        </>
      )}
    </>
  );
}
