import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useLazyQuery } from "@apollo/client";
import { GET_USER } from "../../queries/userQueries";
// import { GET_PRODUCT } from "../queries/productQueries";
import SpinnerCustom from "../SpinnerCustom";
import UserEditForm from "./UserEditForm";
import moment from "moment";
import ProductUserModal from "../modals/ProductUserModal";
import { UITextContext } from "../TranslationWrapper";
import { TbEdit } from "react-icons/tb";
import { Button, Modal } from "react-bootstrap";
import { IconModeContext, DarkModeContext } from "../../App";
import { auth, defaultUserIMGPath } from "../../helper/helper";
import useCustomError from "../../helper/hooks/useCustomError";

export default function UserDeletedShowInfo() {
  const [showIMGZoomModal, setShowIMGZoomModal] = useState(false);

  const [handleCustomError] = useCustomError();
  const UIText = useContext(UITextContext);
  const iconMode = useContext(IconModeContext);
  const darkMode = useContext(DarkModeContext);

  const { id } = useParams();

  const { loading, error, data } = useQuery(GET_USER, {
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
    if (data?.user.createdBy) {
      console.log("data.user.createdBy:", data.user.createdBy);
      getCreatorUser({ variables: { id: data.user.createdBy } });
    }
    if (data?.user.updatedBy) {
      console.log("data.user.updatedBy:", data.user.updatedBy);
      getEditorUser({ variables: { id: data.user.updatedBy } });
    }
  }, [data?.user.createdBy, data?.user.updatedBy]);

  if (loading) return <SpinnerCustom />;

  if (error) {
    handleCustomError(error);
  }

  // if (!loading && !error && data) {
  //   getUser({ variables: { id: data.product.createdBy } });
  // }

  // console.log("product:", data.product);
  // console.log("userData:", userData);

  // if the user is valid than return that user (it needs to avoid an expoit:
  // you have validusers reading rights, so you can read users/ID
  // and you dont have invalidusers reading right, so you CANT read users/deleted/ID
  // BUT there was an exploit: if you copy the deleteduser ID and use user/ID, you can read the deleted user with validusers reading right...)
  if (data && !data?.user?.valid) {
    return (
      <>
        {console.log("data:", data)}
        {!loading && !error && data && (
          <>
            {" "}
            {/* 'card mx-1 px-01 mb-2 product' */}
            <div
              className={
                (!data.user.valid ? "deletedProduct-card " : "") +
                "card mx-auto w-75 px-1 mt-4 "
              }
              style={{ width: "18rem" }}
            >
              <div className="mt-2 text-center">
                <img
                  id="imgFrame"
                  src={data.user.image || "../../../" + defaultUserIMGPath}
                  className="img-fluid mb-2 align-self-center justify-content-center text-center"
                  style={{ maxWidth: "500px" }}
                  onDoubleClick={
                    data.user.image ? () => setShowIMGZoomModal(true) : () => {}
                  }
                />
              </div>

              <div className="card-body">
                <h5 className="card-title">
                  <div>
                    <Link to={-1} className="mt-3 h6">
                      Go Back
                    </Link>
                  </div>
                  <div className="mt-3 h5">Username: {data.user.username}</div>
                </h5>
                <p className="card-text mt-1 mb-0 pt-1">
                  Email: {data.user.email}
                </p>
                <div className="product-admin-info">
                  <p className="card-text mt-1 mb-0 pt-1">
                    Created By:{" "}
                    {creatorUserData ? creatorUserData.user.username : "Hidden"}
                  </p>
                  <p className="card-text mt-1 mb-0 pt-1">
                    Created At:{" "}
                    {/* {new Date(data.user.createdAt).toISOString()} */}
                    {moment(data.user.createdAt).toLocaleString()}
                  </p>
                  {data.user.createdAt !== data.user.updatedAt && (
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
                        {moment(data.user.updatedAt).toLocaleString()}
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-2">
                  <>
                    {auth.isSet(auth.PERMS.remove_user) &&
                      !auth.isReadingOwnUser(data.user.id) &&
                      !data.user.permissions.includes("protected") && (
                        <ProductUserModal
                          bind="user"
                          iconMode={iconMode}
                          itemIdsNamesToProcess={[
                            [data.user.id, data.user.username, data.user.email],
                          ]}
                          didItemComeFromItself={true}
                          redirectPathAfterSuccess={"/users/deleted"}
                          areThereMultipleProducts={false}
                          modalType="Remove"
                          deleteBTNClass={"btn btn-danger p-2 me-2 mb-2 mt-2 "}
                          modalTitle={UIText.removeUserTitle}
                          modalText={UIText.removeUserText}
                          modalButtonText={UIText.removeButtonText}
                          modalCloseButtonText={UIText.closeButtonText}
                        />
                      )}
                    {auth.isSet(auth.PERMS.restore_user) &&
                      !auth.isReadingOwnUser(data.user.id) &&
                      !data.user.permissions.includes("protected") && (
                        /* restore form */
                        <ProductUserModal
                          bind="user"
                          iconMode={iconMode}
                          itemIdsNamesToProcess={[
                            [data.user.id, data.user.username, data.user.email],
                          ]}
                          didItemComeFromItself={true}
                          redirectPathAfterSuccess={"/users/deleted"}
                          areThereMultipleProducts={false}
                          modalType="Restore"
                          deleteBTNClass={
                            "btn btn-primary p-2 ms-1 me-2 mb-2 mt-2 "
                          }
                          modalTitle={UIText.restoreUserTitle}
                          modalText={UIText.restoreUserText}
                          modalButtonText={UIText.restoreButtonText}
                          modalCloseButtonText={UIText.closeButtonText}
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
                              data.user.image ||
                              "../../../" + defaultUserIMGPath
                            }
                            className="img-fluid mb-2 align-self-center justify-content-center text-center"
                            //style={{ maxWidth: "500px" }}
                          />
                        </div>
                      </Modal.Body>
                      <Modal.Footer
                        className={darkMode && "bg-dark text-white"}
                      >
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
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  } else return <>User Not Found</>;
}
