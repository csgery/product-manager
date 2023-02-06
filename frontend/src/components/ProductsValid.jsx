import { useState, useEffect, useContext, useCallback } from "react";
import { useQuery } from "@apollo/client";
import Spinner from "./Spinner";
import Product from "./Product";
import ProductCreateModal from "./modals/ProductCreateModal";
import ProductUserModal from "./modals/ProductUserModal";
import { GET_VALIDPRODUCTS } from "../queries/productQueries";
import { Button } from "react-bootstrap";
import { handleCustomError } from "../helper/helper";
import { useNavigate } from "react-router-dom";
import { RefreshTokenMutationContext } from "../pages/TokenWrapper";
import { DarkModeContext } from "./../App";
import { UITextContext } from "./TranslationWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { TbTrash, TbCirclePlus } from "react-icons/tb";
import { ImCancelCircle } from "react-icons/im";
import { GrClose } from "react-icons/gr";
import { BiSelectMultiple } from "react-icons/bi";
import { IconModeContext } from "../App";
import Searchbar from "./Searchbar";

export default function ProductsDeleted() {
  const { loading, error, data } = useQuery(GET_VALIDPRODUCTS);
  const [showDeleteCBs, setShowDeleteCBs] = useState(false);
  const [idsNamesToDelete, setIdsNamesToDelete] = useState([]);
  const [deleteBTNClass, setDeleteBTNClass] = useState(
    "btn btn-danger p-2 ms-1 me-2 mb-2 disabled"
  );
  const [validProducts, setValidProducts] = useState([]);

  const navigate = useNavigate();
  const UIText = useContext(UITextContext);
  const iconMode = useContext(IconModeContext);
  const getRefreshToken = useContext(RefreshTokenMutationContext);
  const darkMode = useContext(DarkModeContext);

  useEffect(() => {
    if (data && data.validProducts) {
      // If validProducts's changed(because delete, restore or remove something) change the view data
      setValidProducts(data.validProducts);
    }
  }, [data?.validProducts]);

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
    handleCustomError(error, navigate, getRefreshToken);
  }

  const handleSelectAllProducts = () => {
    // if idsNamesToDelete contains ALL of the actual elements from validProducts view -> remove them from idsNamesToDelete

    // loop through validProducts
    // if validProduct is in the deletedProducts then add +1 to a counter
    // after the loop if counter == validProducts.length -> it means all of the validProducts has already in the deletedProducts -> remove them from the deletedProducts
    let counter = 0;
    validProducts.forEach((item) => {
      const product = idsNamesToDelete.find(
        (idNameToDelete) => idNameToDelete[0] === item.id
      );
      if (product) {
        counter++;
      }
    });
    if (counter === validProducts.length) {
      // console.log(
      //   "all validProducts have already in the idsNamesToDelete list, REMOVE THEM!"
      // );

      validProducts.forEach((validProduct) => {
        setIdsNamesToDelete((oldIdsNamesToDelete) =>
          oldIdsNamesToDelete.filter(
            (idNameToDelete) => validProduct.id !== idNameToDelete[0]
          )
        );
      });
    }

    // else add the validProducts which is not in the idsNamesToDelete
    validProducts.forEach((validProduct) => {
      // check if the product has already set for delete
      const selectedProduct = idsNamesToDelete.find(
        (item) => item[0] === validProduct.id
      );
      // if not then add to the array
      if (!selectedProduct) {
        setIdsNamesToDelete((oldValues) => [
          ...oldValues,
          [validProduct.id, validProduct.name, validProduct.shortId],
        ]);
      }
    });
  };

  return (
    <>
      {!loading && !error && (
        <>
          <div className="mt-5">
            <ProductCreateModal />
            {data && data.validProducts.length > 0 ? (
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
                      bind="product"
                      iconMode={iconMode}
                      itemIdsNamesToProcess={idsNamesToDelete}
                      areThereMultipleProducts={idsNamesToDelete?.length > 1}
                      modalType="Delete"
                      deleteBTNClass={deleteBTNClass}
                      handleShow={handleShow}
                      modalTitle={UIText.deleteProductTitle}
                      modalText={
                        idsNamesToDelete?.length > 1
                          ? UIText.deleteProductsText
                          : UIText.deleteProductText
                      }
                      modalButtonText={UIText.deleteButtonText}
                      modalCloseButtonText={UIText.closeButtonText}
                    />
                    <Button
                      className="btn btn-light p-2 ms-1 me-2 mb-2"
                      onClick={handleSelectAllProducts}
                    >
                      {iconMode ? (
                        <BiSelectMultiple style={{ fontSize: "1.6rem" }} />
                      ) : (
                        UIText.selectAllButtonText
                      )}
                    </Button>
                  </div>
                )}
                {console.log(
                  "validProducts BEFORE searchbar:",
                  data.validProducts
                )}
                <Searchbar
                  allItemsFromDB={data.validProducts || "12"}
                  setItemsToView={setValidProducts}
                />
              </>
            ) : (
              <h3 className="mt-2">There is no products</h3>
            )}
          </div>
          {console.log("validProducts", validProducts)}
          {validProducts?.length > 0 && (
            <>
              <div className="d-flex align-center justify-content-between mt-3 pb-5 product-card-row ">
                {console.log("validProducts:", validProducts)}
                {console.log(
                  "inside product rendering idsNamesToDelete:",
                  idsNamesToDelete
                )}
                {validProducts.map((validProduct) => (
                  <Product
                    showDeleteCBs={showDeleteCBs}
                    setIdsNamesToDelete={setIdsNamesToDelete}
                    key={validProduct.id}
                    product={validProduct}
                    cardBackgroundClass={
                      darkMode ? " text-white bg-dark " : " bg-light "
                    }
                    setDeleteCBChecked={
                      // idsNamesToDelete = [ []. [], ... [] ] array of arrays
                      idsNamesToDelete.find(
                        // item[0] === id field of the array
                        (item) => item[0] === validProduct.id
                      )
                        ? true
                        : false
                    }
                  />
                ))}
              </div>
            </>
          )}

          {validProducts.length === 0 &&
            data.validProducts.length > 0 &&
            // searchbarValue !== "" &&
            "NO searched data"}
        </>
      )}
    </>
  );
}
