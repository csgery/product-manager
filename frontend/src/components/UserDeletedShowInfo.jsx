import React, {
  useState,
  createRef,
  useRef,
  useEffect,
  useContext,
} from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useLazyQuery } from "@apollo/client";
import { GET_USER } from "../queries/userQueries";
// import { GET_PRODUCT } from "../queries/productQueries";
import Spinner from "./Spinner";
import UserEditForm from "./UserEditForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import moment from "moment";
import ProductUserModal from "./modals/ProductUserModal";
import { UITextContext } from "./TranslationWrapper";
import { TbEdit } from "react-icons/tb";
import { Button, Modal } from "react-bootstrap";
import { IconModeContext } from "../App";

export default function UserDeletedShowInfo() {
  const [toggleEditForm, setToggleEditForm] = useState(false);

  const UIText = useContext(UITextContext);
  const iconMode = useContext(IconModeContext);

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
    } else if (data?.user.updatedBy) {
      console.log("data.user.updatedBy:", data.user.updatedBy);
      getEditorUser({ variables: { id: data.user.updatedBy } });
    }
  }, [data?.user.createdBy, data?.user.updatedBy]);

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

  // if the user is valid than return that user (it needs to avoid an expoit:
  // you have validusers reading rights, so you can read users/ID
  // and you dont have invalidusers reading right, so you CANT read users/deleted/ID
  // BUT there was an exploit: if you copy the deleteduser ID and use user/ID, you can read the deleted user with validusers reading right...)
  if (!data.user.valid) {
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

                {!toggleEditForm && (
                  <div className="mt-2">
                    {data.user.valid && (
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
                            [data.user.id, data.user.username, data.user.email],
                          ]}
                          didProductComeFromItself={true}
                          redirectPathAfterSuccess={"/users/"}
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
                    {!data.user?.valid && (
                      <>
                        <ProductUserModal
                          bind="product"
                          iconMode={iconMode}
                          itemIdsNamesToProcess={[
                            [data.user.id, data.user.username, data.user.email],
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
                            [data.user.id, data.user.username, data.user.email],
                          ]}
                          didItemComeFromItself={true}
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
            {data.user.valid && toggleEditForm && (
              <UserEditForm
                user={data.user}
                setToggleEditForm={setToggleEditForm}
                iconMode={iconMode}
              />
            )}
          </>
        )}
      </>
    );
  } else return <>User Not Found</>;
}
