import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Spinner from "./Spinner";
import Product from "./Product";
import ProductCreateModal from "./modals/ProductCreateModal";
import ProductUserModal from "./modals/ProductUserModal";
import { GET_DELETEDPRODUCTS } from "../queries/productQueries";
import { Button } from "react-bootstrap";
import { RefreshTokenMutationContext } from "../pages/TokenWrapper";
import { handleCustomError } from "../helper/helper";
import { UITextContext } from "./TranslationWrapper";
import { BiSelectMultiple } from "react-icons/bi";
import { GrClose } from "react-icons/gr";
import { TbTrash, TbTrashOff } from "react-icons/tb";
import { IconModeContext } from "../App";

export default function ProductsDeleted() {
  const { loading, error, data } = useQuery(GET_DELETEDPRODUCTS);
  const [showDeleteCBs, setShowDeleteCBs] = useState(false);
  const [idsNamesToDelete, setIdsNamesToDelete] = useState([]);
  const [deleteBTNClass, setDeleteBTNClass] = useState(
    "btn btn-danger p-2 ms-2 disabled "
  );
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [searchbarValue, setSearchbarValue] = useState("");
  const [searchTypeBTN, setSearchTypeBTN] = useState(
    localStorage.getItem("searchTypeBTN") || "wholeWord"
  );

  const getRefreshToken = useContext(RefreshTokenMutationContext);

  const navigate = useNavigate();
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
    if (data && data.deletedProducts) {
      setDeletedProducts(data.deletedProducts);
      // After a product is deleted clear the searchbar
      setSearchbarValue("");
    }
  }, [data?.deletedProducts]);

  const handleSearchChange = (value) => {
    setSearchbarValue(() => value);
    const fieldToSearchIn = "name"; // later implement: name or shortId
    // console.log("value:", value);
    // console.log("searchTypeBTN:", searchTypeBTN);
    if (value === "") {
      setDeletedProducts(data.deletedProducts);
    } else if (value) {
      // if whole text vs if pattern matching (from a button)
      // const searchedData = data.validProducts.filter((item) =>
      //   item.name./*toLowerCase().*/ includes(value)
      // );
      const regex =
        searchTypeBTN === "wholeWord"
          ? new RegExp(`^${value}`)
          : new RegExp(`${value}`);
      // console.log("regex", regex);
      // console.log("searchbarValue state", searchbarValue);
      const searchedData = data.deletedProducts.filter((item) =>
        regex.test(item[fieldToSearchIn].toLowerCase())
      );
      // console.log("searchedData:", searchedData);
      if (searchedData) {
        setDeletedProducts(searchedData);
      } else {
        setDeletedProducts([]);
      }
    }
  };

  useEffect(() => {
    if (data?.deletedProducts) {
      handleSearchChange(searchbarValue);
    }
  }, [searchTypeBTN]);

  const handleSearchTypeBTNClick = (e) => {
    localStorage.setItem("searchTypeBTN", e.target.value);
    setSearchTypeBTN(e.target.value);
    //handleSearchChange(searchbarValue);
    //console.log(e.target.value);
  };

  const handleSelectAllProducts = () => {
    // if idsNamesToDelete contains ALL of the actual elements from validProducts view -> remove them from idsNamesToDelete

    // loop through validProducts
    // if validProduct is in the deletedProducts then add +1 to a counter
    // after the loop if counter == validProducts.length -> it means all of the validProducts has already in the deletedProducts -> remove them from the deletedProducts
    let counter = 0;
    deletedProducts.forEach((item) => {
      const product = idsNamesToDelete.find(
        (idNameToDelete) => idNameToDelete[0] === item.id
      );
      if (product) {
        counter++;
      }
    });
    if (counter === deletedProducts.length) {
      // console.log(
      //   "all validProducts have already in the idsNamesToDelete list, REMOVE THEM!"
      // );

      deletedProducts.forEach((deletedProduct) => {
        setIdsNamesToDelete((oldIdsNamesToDelete) =>
          oldIdsNamesToDelete.filter(
            (idNameToDelete) => deletedProduct.id !== idNameToDelete[0]
          )
        );
      });
    }

    // else add the validProducts which is not in the idsNamesToDelete
    deletedProducts.forEach((deletedProduct) => {
      // check if the product has already set for delete
      const selectedProduct = idsNamesToDelete.find(
        (item) => item[0] === deletedProduct.id
      );
      // if not then add to the array
      if (!selectedProduct) {
        setIdsNamesToDelete((oldValues) => [
          ...oldValues,
          [deletedProduct.id, deletedProduct.name, deletedProduct.shortId],
        ]);
      }
    });
  };

  if (loading) return <Spinner />;

  if (error) {
    handleCustomError(error, navigate, getRefreshToken);
  }

  console.log(data);

  return (
    <>
      {!loading && !error && (
        <>
          {data && data.deletedProducts.length > 0 ? (
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
                      UIText.removeRestoreMultipleProductsButtonText
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
                      bind="product"
                      iconMode={iconMode}
                      itemIdsNamesToProcess={idsNamesToDelete}
                      areThereMultipleProducts={idsNamesToDelete?.length > 1}
                      modalType="Remove"
                      deleteBTNClass={deleteBTNClass}
                      handleShow={handleShow}
                      modalTitle={
                        idsNamesToDelete?.length > 1
                          ? UIText.removeProductsTitle
                          : UIText.removeProductTitle
                      }
                      modalText={
                        idsNamesToDelete?.length > 1
                          ? UIText.removeProductsText
                          : UIText.removeProductText
                      }
                      modalButtonText={UIText.removeButtonText}
                      modalCloseButtonText={UIText.closeButtonText}
                    />

                    <ProductUserModal
                      bind="product"
                      iconMode={iconMode}
                      itemIdsNamesToProcess={idsNamesToDelete}
                      areThereMultipleProducts={idsNamesToDelete?.length > 1}
                      modalType="Restore"
                      deleteBTNClass={deleteBTNClass}
                      handleShow={handleShow}
                      modalTitle={
                        idsNamesToDelete?.length > 1
                          ? UIText.restoreProductsTitle
                          : UIText.restoreProductTitle
                      }
                      modalText={
                        idsNamesToDelete?.length > 1
                          ? UIText.restoreProductsText
                          : UIText.restoreProductText
                      }
                      modalButtonText={UIText.restoreButtonText}
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
                  </>
                )}
              </div>

              <div className="d-flex" role="search">
                <input
                  className="form-control me-2 ms-1"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  onChange={(e) => handleSearchChange(e.target.value)}
                  value={searchbarValue}
                />
                <button
                  className={
                    (searchTypeBTN === "wholeWord"
                      ? "btn btn-light "
                      : "btn btn-outline-light ") + "me-1"
                  }
                  value="wholeWord"
                  onClick={(e) => handleSearchTypeBTNClick(e)}
                >
                  {UIText.wholeWordButtonText}
                </button>
                <button
                  className={
                    searchTypeBTN === "matchCase"
                      ? "btn btn-light "
                      : "btn btn-outline-light "
                  }
                  value="matchCase"
                  onClick={(e) => handleSearchTypeBTNClick(e)}
                >
                  {UIText.matchCaseButtonText}
                </button>
              </div>
            </>
          ) : (
            <h3 className="mt-2">There is no deleted products</h3>
          )}
          {deletedProducts.length > 0 && (
            <div className="d-flex align-center justify-content-between mt-3 pb-5 product-card-row ">
              {deletedProducts.map((deletedProduct) => (
                <Product
                  showDeleteCBs={showDeleteCBs}
                  setIdsNamesToDelete={setIdsNamesToDelete}
                  key={deletedProduct.id}
                  product={deletedProduct}
                  cardBackgroundClass={"deletedProduct-card"}
                  setDeleteCBChecked={
                    // idsNamesToDelete = [ []. [], ... [] ] array of arrays
                    idsNamesToDelete.find(
                      // item[0] === id field of the array
                      (item) => item[0] === deletedProduct.id
                    )
                      ? true
                      : false
                  }
                />
              ))}
            </div>
          )}
          {deletedProducts.length === 0 &&
            data.deletedProducts.length > 0 &&
            searchbarValue !== "" &&
            "NO searched data"}
        </>
      )}
    </>
  );
}
