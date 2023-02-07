import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Spinner from "./Spinner";
import User from "./User";
import ProductUserModal from "./modals/ProductUserModal";
import { GET_DELETEDUSERS } from "../queries/userQueries";
import { Button } from "react-bootstrap";
import { UITextContext } from "./TranslationWrapper";
import { BiSelectMultiple } from "react-icons/bi";
import { GrClose } from "react-icons/gr";
import { TbTrash, TbTrashOff } from "react-icons/tb";
import { IconModeContext } from "../App";
import Searchbar from "./Searchbar";
import useCustomError from "../helper/hooks/useCustomError";

export default function UsersDeleted() {
  const { loading, error, data } = useQuery(GET_DELETEDUSERS);
  const [showDeleteCBs, setShowDeleteCBs] = useState(false);
  const [idsNamesToDelete, setIdsNamesToDelete] = useState([]);
  const [deleteBTNClass, setDeleteBTNClass] = useState(
    "btn btn-danger p-2 ms-2 disabled "
  );
  const [deletedUsers, setDeletedUsers] = useState([]);

  const [handleCustomError] = useCustomError();

  const UIText = useContext(UITextContext);
  const iconMode = useContext(IconModeContext);

  useEffect(() => {
    console.log(idsNamesToDelete);
    if (!showDeleteCBs) {
      return;
    }
    // if there is nothing to delete disable the delete button
    if (idsNamesToDelete.length > 0) {
      setDeleteBTNClass("btn btn-danger p-2 ms-1 me-2 mb-2 ");
    } else {
      setDeleteBTNClass("btn btn-danger p-2 ms-1 me-2 mb-2 disabled ");
    }
  }, [idsNamesToDelete]);

  const handleShow = () => {
    setIdsNamesToDelete(() => []);
    setShowDeleteCBs(!showDeleteCBs);
  };

  useEffect(() => {
    if (data && data.deletedUsers) {
      // If validProducts's changed(because delete, restore or remove something) change the view data
      setDeletedUsers(data.deletedUsers);
    }
  }, [data?.deletedUsers]);

  const handleSelectAllUsers = () => {
    // if idsNamesToDelete contains ALL of the actual elements from validProducts view -> remove them from idsNamesToDelete

    // loop through validProducts
    // if validProduct is in the deletedProducts then add +1 to a counter
    // after the loop if counter == validProducts.length -> it means all of the validProducts has already in the deletedProducts -> remove them from the deletedProducts
    let counter = 0;
    deletedUsers.forEach((item) => {
      const user = idsNamesToDelete.find(
        (idNameToDelete) => idNameToDelete[0] === item.id
      );
      if (user) {
        counter++;
      }
    });
    if (counter === deletedUsers.length) {
      // console.log(
      //   "all validProducts have already in the idsNamesToDelete list, REMOVE THEM!"
      // );

      deletedUsers.forEach((deletedUser) => {
        setIdsNamesToDelete((oldIdsNamesToDelete) =>
          oldIdsNamesToDelete.filter(
            (idNameToDelete) => deletedUser.id !== idNameToDelete[0]
          )
        );
      });
    }

    // else add the validProducts which is not in the idsNamesToDelete
    deletedUsers.forEach((deletedUser) => {
      // check if the product has already set for delete
      const selectedProduct = idsNamesToDelete.find(
        (item) => item[0] === deletedUser.id
      );
      // if not then add to the array
      if (!selectedProduct) {
        setIdsNamesToDelete((oldValues) => [
          ...oldValues,
          [deletedUser.id, deletedUser.username, deletedUser.email],
        ]);
      }
    });
  };

  if (loading) return <Spinner />;

  if (error) {
    handleCustomError(error);
  }

  console.log(data);

  return (
    <>
      {!loading && !error && (
        <>
          {data && data.deletedUsers.length > 0 ? (
            <>
              <div className="mt-5">
                {!showDeleteCBs ? (
                  <Button
                    className="btn btn-light p-2 ms-1 me-2 mb-2"
                    onClick={handleShow}
                  >
                    {iconMode ? (
                      <>
                        <TbTrash
                          style={{
                            fontSize: "1.8rem",
                            color: "red",
                            marginRight: "0.5em",
                          }}
                        />
                        <TbTrashOff
                          style={{ fontSize: "1.8rem", color: "#0d6efd" }}
                        />
                      </>
                    ) : (
                      UIText.removeRestoreMultipleUsersButtonText
                    )}
                  </Button>
                ) : (
                  <Button
                    className="btn btn-light p-2 ms-1 me-2 mb-2"
                    onClick={handleShow}
                  >
                    {iconMode ? (
                      <GrClose style={{ fontSize: "1.4rem" }} />
                    ) : (
                      UIText.closeButtonText
                    )}
                  </Button>
                )}

                {showDeleteCBs && (
                  <>
                    <ProductUserModal
                      bind="user"
                      iconMode={iconMode}
                      itemIdsNamesToProcess={idsNamesToDelete}
                      areThereMultipleProducts={idsNamesToDelete?.length > 1}
                      modalType="Remove"
                      deleteBTNClass={deleteBTNClass}
                      handleShow={handleShow}
                      modalTitle={
                        idsNamesToDelete?.length > 1
                          ? UIText.removeUsersTitle
                          : UIText.removeUserTitle
                      }
                      modalText={
                        idsNamesToDelete?.length > 1
                          ? UIText.removeUsersText
                          : UIText.removeUserText
                      }
                      modalButtonText={UIText.removeButtonText}
                      modalCloseButtonText={UIText.closeButtonText}
                    />

                    <ProductUserModal
                      bind="user"
                      iconMode={iconMode}
                      itemIdsNamesToProcess={idsNamesToDelete}
                      areThereMultipleProducts={idsNamesToDelete?.length > 1}
                      modalType="Restore"
                      deleteBTNClass={deleteBTNClass}
                      handleShow={handleShow}
                      modalTitle={
                        idsNamesToDelete?.length > 1
                          ? UIText.restoreUsersTitle
                          : UIText.restoreUserTitle
                      }
                      modalText={
                        idsNamesToDelete?.length > 1
                          ? UIText.restoreUsersText
                          : UIText.restoreUserText
                      }
                      modalButtonText={UIText.restoreButtonText}
                      modalCloseButtonText={UIText.closeButtonText}
                    />
                    <Button
                      className="btn btn-light p-2 ms-1 me-2 mb-2"
                      onClick={handleSelectAllUsers}
                    >
                      {iconMode ? (
                        <BiSelectMultiple style={{ fontSize: "1.6rem" }} />
                      ) : (
                        UIText.selectAllButtonText
                      )}
                    </Button>
                  </>
                )}
              </div>

              <Searchbar
                allItemsFromDB={data.deletedUsers}
                setItemsToView={setDeletedUsers}
                searchbarBind="user"
              />
            </>
          ) : (
            <h3 className="mt-2">There is no deleted users</h3>
          )}
          {deletedUsers.length > 0 && (
            <div className="d-flex align-center justify-content-between mt-3 pb-5 product-card-row ">
              {deletedUsers.map((deletedUser) => (
                <User
                  showDeleteCBs={showDeleteCBs}
                  setIdsNamesToDelete={setIdsNamesToDelete}
                  key={deletedUser.id}
                  user={deletedUser}
                  cardBackgroundClass={"deletedProduct-card"}
                  setDeleteCBChecked={
                    // idsNamesToDelete = [ []. [], ... [] ] array of arrays
                    idsNamesToDelete.find(
                      // item[0] === id field of the array
                      (item) => item[0] === deletedUser.id
                    )
                      ? true
                      : false
                  }
                />
              ))}
            </div>
          )}
          {deletedUsers.length === 0 &&
            data.deletedUsers.length > 0 &&
            // searchbarValue !== "" &&
            "NO searched data"}
        </>
      )}
    </>
  );
}
