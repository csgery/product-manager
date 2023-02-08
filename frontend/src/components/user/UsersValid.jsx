import { useState, useEffect, useContext } from "react";
import { useQuery } from "@apollo/client";
import Spinner from "../Spinner";
import User from "./User";
import UserCreateModal from "../modals/UserCreateModal";
import ProductUserModal from "../modals/ProductUserModal";
import { GET_VALIDUSERS } from "../../queries/userQueries";
import { Button } from "react-bootstrap";
import useCustomError from "../../helper/hooks/useCustomError";
import { useNavigate } from "react-router-dom";
import { DarkModeContext } from "../../App";
import { UITextContext } from "../TranslationWrapper";
import { TbTrash } from "react-icons/tb";
import { GrClose } from "react-icons/gr";
import { BiSelectMultiple } from "react-icons/bi";
import { IconModeContext } from "../../App";
import Searchbar from "../Searchbar";

export default function UsersValid() {
  const { loading, error, data } = useQuery(GET_VALIDUSERS);
  const [showDeleteCBs, setShowDeleteCBs] = useState(false);
  const [idsNamesToDelete, setIdsNamesToDelete] = useState([]);
  const [deleteBTNClass, setDeleteBTNClass] = useState(
    "btn btn-danger p-2 ms-1 me-2 mb-2 disabled"
  );
  const [validUsers, setValidUsers] = useState([]);

  const [handleCustomError] = useCustomError();

  const navigate = useNavigate();
  const UIText = useContext(UITextContext);
  const iconMode = useContext(IconModeContext);
  const darkMode = useContext(DarkModeContext);

  useEffect(() => {
    if (data && data.validUsers) {
      // If validProducts's changed(because delete, restore or remove something) change the view data
      setValidUsers(data.validUsers);
    }
  }, [data?.validUsers]);

  useEffect(() => {
    console.log(idsNamesToDelete);
    if (!showDeleteCBs) {
      return;
    }
    // if there is nothing to delete disable the delete button
    if (idsNamesToDelete.length > 0) {
      setDeleteBTNClass("btn btn-danger p-2 ms-1 me-2 mb-2");
    } else {
      setDeleteBTNClass("btn btn-danger p-2 ms-1 me-2 mb-2 disabled");
    }
  }, [idsNamesToDelete]);

  const handleShow = () => {
    setIdsNamesToDelete(() => []);
    setShowDeleteCBs(!showDeleteCBs);
  };

  if (loading) return <Spinner />;

  // if (error) return <p>Something Went Wrong {error.message}</p>;
  if (error) {
    handleCustomError(error);
  }

  const handleSelectAllUsers = () => {
    // if idsNamesToDelete contains ALL of the actual elements from validProducts view -> remove them from idsNamesToDelete

    // loop through validProducts
    // if validProduct is in the deletedProducts then add +1 to a counter
    // after the loop if counter == validProducts.length -> it means all of the validProducts has already in the deletedProducts -> remove them from the deletedProducts
    let counter = 0;
    validUsers.forEach((item) => {
      const user = idsNamesToDelete.find(
        (idNameToDelete) => idNameToDelete[0] === item.id
      );
      if (user) {
        counter++;
      }
    });
    if (counter === validUsers.length) {
      // console.log(
      //   "all validProducts have already in the idsNamesToDelete list, REMOVE THEM!"
      // );

      validUsers.forEach((validUser) => {
        setIdsNamesToDelete((oldIdsNamesToDelete) =>
          oldIdsNamesToDelete.filter(
            (idNameToDelete) => validUser.id !== idNameToDelete[0]
          )
        );
      });
    }

    // else add the validProducts which is not in the idsNamesToDelete
    validUsers.forEach((validUser) => {
      // check if the product has already set for delete
      const selectedUser = idsNamesToDelete.find(
        (item) => item[0] === validUser.id
      );
      // if not then add to the array
      if (!selectedUser) {
        setIdsNamesToDelete((oldValues) => [
          ...oldValues,
          [validUser.id, validUser.username, validUser.email],
        ]);
      }
    });
  };

  return (
    <>
      {!loading && !error && (
        <>
          <div className="mt-5">
            <UserCreateModal />
            {data && data.validUsers.length > 0 ? (
              <>
                {!showDeleteCBs ? (
                  <Button
                    className="btn btn-danger p-2 ms-1 me-2 mb-2"
                    onClick={handleShow}
                  >
                    {!iconMode ? (
                      UIText.deleteMultipleProductsButtonText
                    ) : (
                      <TbTrash style={{ fontSize: "1.6rem" }} />
                    )}
                  </Button>
                ) : (
                  <div>
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
                    <ProductUserModal
                      bind="user"
                      iconMode={iconMode}
                      itemIdsNamesToProcess={idsNamesToDelete}
                      areThereMultipleProducts={idsNamesToDelete?.length > 1}
                      modalType="Delete"
                      deleteBTNClass={deleteBTNClass}
                      handleShow={handleShow}
                      modalTitle={UIText.deleteUserTitle}
                      modalText={
                        idsNamesToDelete?.length > 1
                          ? UIText.deleteUsersText
                          : UIText.deleteUserText
                      }
                      modalButtonText={UIText.deleteButtonText}
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
                  </div>
                )}
                {console.log("validUsers BEFORE searchbar:", data.validUsers)}
                <Searchbar
                  allItemsFromDB={data.validUsers}
                  setItemsToView={setValidUsers}
                  searchbarBind="user"
                />
              </>
            ) : (
              <h3 className="mt-2">There is users</h3>
            )}
          </div>
          {console.log("validUsers", validUsers)}
          {validUsers?.length > 0 && (
            <>
              <div className="d-flex align-center justify-content-between mt-3 pb-5 product-card-row ">
                {console.log("validUsers:", validUsers)}
                {console.log(
                  "inside product rendering idsNamesToDelete:",
                  idsNamesToDelete
                )}
                {validUsers.map((validUser) => (
                  <User
                    showDeleteCBs={showDeleteCBs}
                    setIdsNamesToDelete={setIdsNamesToDelete}
                    key={validUser.id}
                    user={validUser}
                    cardBackgroundClass={
                      darkMode ? " text-white bg-dark " : " bg-light "
                    }
                    setDeleteCBChecked={
                      // idsNamesToDelete = [ []. [], ... [] ] array of arrays
                      idsNamesToDelete.find(
                        // item[0] === id field of the array
                        (item) => item[0] === validUser.id
                      )
                        ? true
                        : false
                    }
                  />
                ))}
              </div>
            </>
          )}

          {validUsers.length === 0 &&
            data.validUsers.length > 0 &&
            // searchbarValue !== "" &&
            "NO searched data"}
        </>
      )}
    </>
  );
}
