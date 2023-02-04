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

export default function ProductsDeleted() {
  const { loading, error, data } = useQuery(GET_VALIDPRODUCTS);
  const [showDeleteCBs, setShowDeleteCBs] = useState(false);
  const [idsNamesToDelete, setIdsNamesToDelete] = useState([]);
  const [deleteBTNClass, setDeleteBTNClass] = useState(
    "btn btn-danger p-2 ms-1 me-2 mb-2 disabled"
  );
  const [validProducts, setValidProducts] = useState([]);
  const [searchbarValue, setSearchbarValue] = useState("");
  const [searchTypeBTN, setSearchTypeBTN] = useState(
    localStorage.getItem("searchTypeBTN") || "wholeWord"
  );

  const navigate = useNavigate();
  const UIText = useContext(UITextContext);
  const iconMode = useContext(IconModeContext);

  const getRefreshToken = useContext(RefreshTokenMutationContext);
  const darkMode = useContext(DarkModeContext);

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

  useEffect(() => {
    if (data && data.validProducts) {
      setValidProducts(data.validProducts);
      // After a product is deleted clear the searchbar
      setSearchbarValue("");
    }
  }, [data?.validProducts]);

  const handleSearchChange = (value) => {
    setSearchbarValue(() => value);
    const fieldToSearchIn = "name"; // later implement: name or shortId
    // console.log("value:", value);
    // console.log("searchTypeBTN:", searchTypeBTN);
    if (value === "") {
      setValidProducts(data.validProducts);
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
      const searchedData = data.validProducts.filter((item) =>
        regex.test(item[fieldToSearchIn].toLowerCase())
      );
      // console.log("searchedData:", searchedData);
      if (searchedData) {
        setValidProducts(searchedData);
      } else {
        setValidProducts([]);
      }
    }
  };

  useEffect(() => {
    if (data?.validProducts) {
      handleSearchChange(searchbarValue);
    }
  }, [searchTypeBTN]);

  const handleShow = () => {
    setIdsNamesToDelete(() => []);
    setShowDeleteCBs(!showDeleteCBs);
  };

  if (loading) return <Spinner />;

  // if (error) return <p>Something Went Wrong {error.message}</p>;
  if (error) {
    handleCustomError(error, navigate, getRefreshToken);
  }

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
              <h3 className="mt-2">There is no products</h3>
            )}
          </div>
          {validProducts.length > 0 && (
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
            searchbarValue !== "" &&
            "NO searched data"}
        </>
      )}
    </>
  );
}
