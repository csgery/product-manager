import ProductUserModal from "../modals/ProductUserModal";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useContext } from "react";
import { UITextContext } from "../TranslationWrapper";
import { IconModeContext } from "../../App";
import {
  auth,
  defaultProductIMGPath,
  imageMaxSize,
  imageSupportedFileTypes,
} from "../../helper/helper";

export default function Product({
  product,
  showDeleteCBs = false,
  setDeleteCBChecked,
  setIdsNamesToDelete,
  cardBackgroundClass = "",
}) {
  const UIText = useContext(UITextContext);

  const iconMode = useContext(IconModeContext);

  const navigate = useNavigate();
  const [cbState, setCbState] = useState(false);
  const checkbox = useRef();

  // it looks like it's not re rendering, so we have to set to default the CB value
  // to restore the component's CB value to false (like after the first render)
  useEffect(() => {
    if (!showDeleteCBs) {
      setCbState(false);
    }
  });

  useEffect(() => {
    if (!checkbox.current) {
      return;
    }
    if (setDeleteCBChecked) {
      checkbox.current.checked = true;
    } else {
      checkbox.current.checked = false;
    }
  }, [setDeleteCBChecked]);

  const handleNavigate = () => {
    if (!showDeleteCBs) {
      if (product.valid) navigate(`/products/${product.id}`, { replace: true });
      else navigate(`/products/deleted/${product.id}`, { replace: true });
    }
  };

  const stopPropagation = (e) => {
    //... do something.
    //stop propagation:
    if (!e) var e = window.event;
    //e.cancelBubble = true; //IE
    if (e.stopPropagation) e.stopPropagation(); //other browsers
  };

  const handleClick = () => {
    if (!showDeleteCBs) {
      return false;
    }
    checkbox.current.checked = !checkbox.current.checked;
    handleChange();
  };

  const handleChange = (e) => {
    if (!showDeleteCBs) {
      return false;
    }
    // e.stopPropagation();
    // e.stopImmediatePropagation();
    // console.log(e.target.value);
    // checkbox.current.checked = cbState;
    //checkbox.current.checked = !checkbox.current.checked;
    setCbState(() => !cbState);
    // console.log(cbState);
    // if (e.target.value === "true")
    console.log(checkbox.current.checked);

    // if (checkbox.current.checked === "true")
    if (checkbox.current.checked) {
      console.log("add id");
      setIdsNamesToDelete((oldIdsNamesToDelete) => [
        ...oldIdsNamesToDelete,
        [product.id, product.name, product.shortId],
      ]);
    } else {
      console.log("delete id");
      setIdsNamesToDelete((oldIdsNamesToDelete) => {
        const modifiedValues = oldIdsNamesToDelete.filter(
          (item) => item[0] != product.id
        );
        return modifiedValues;
      });
    }
    // console.log("value:", e.target.value);
  };

  return (
    <>
      {console.log(product.image)}
      <div
        className={"card mx-1 px-01 mb-2 product " + cardBackgroundClass}
        style={{ width: "18rem" }}
      >
        <div
          className="card-body"
          onDoubleClick={handleNavigate}
          onClick={handleClick}
        >
          {showDeleteCBs && (
            <input
              type="checkbox"
              id="deleteCB"
              value={!cbState}
              onChange={handleChange}
              onClick={(e) => stopPropagation(e)}
              defaultChecked={setDeleteCBChecked}
              ref={checkbox}
            />
          )}
          <img
            id="imgFrame"
            src={product.image || defaultProductIMGPath}
            className="img-fluid mb-2"
            style={{ maxWidth: "200px" }}
          />
          <h5 className="card-title">{product.name}</h5>
          <h6 className="card-subtitle mb-2 ">{product.shortId}</h6>
          <p className="card-text">
            Description: Some quick example text to build on the card title and
            make up the bulk of the card's content.
          </p>
          <p className="card-text">Quantity: {product.quantity}</p>

          {!showDeleteCBs && (
            <>
              {product.valid ? (
                auth.isSet(auth.PERMS.delete_product) && (
                  <ProductUserModal
                    bind="product"
                    iconMode={iconMode}
                    itemIdsNamesToProcess={[
                      [product.id, product.name, product.shortId],
                    ]}
                    areThereMultipleProducts={false}
                    modalType="Delete"
                    deleteBTNClass="btn btn-danger p-2 me-2"
                    didItemComeFromItself={true}
                    modalTitle={UIText.deleteProductTitle}
                    modalText={UIText.deleteProductText}
                    modalButtonText={UIText.deleteButtonText}
                    modalCloseButtonText={UIText.closeButtonText}
                  />
                )
              ) : (
                <>
                  {auth.isSet(auth.PERMS.remove_product) && (
                    <ProductUserModal
                      bind="product"
                      iconMode={iconMode}
                      itemIdsNamesToProcess={[
                        [product.id, product.name, product.shortId],
                      ]}
                      areThereMultipleProducts={false}
                      modalType="Remove"
                      deleteBTNClass="btn btn-danger p-2 me-2"
                      didItemComeFromItself={true}
                      modalTitle={UIText.removeProductTitle}
                      modalText={UIText.removeProductText}
                      modalButtonText={UIText.removeButtonText}
                      modalCloseButtonText={UIText.closeButtonText}
                    />
                  )}
                  {auth.isSet(auth.PERMS.restore_product) && (
                    <ProductUserModal
                      bind="product"
                      iconMode={iconMode}
                      itemIdsNamesToProcess={[
                        [product.id, product.name, product.shortId],
                      ]}
                      areThereMultipleProducts={false}
                      modalType="Restore"
                      deleteBTNClass="btn btn-danger p-2 me-2"
                      didItemComeFromItself={true}
                      modalTitle={UIText.restoreProductTitle}
                      modalText={UIText.restoreProductText}
                      modalButtonText={UIText.restoreButtonText}
                      modalCloseButtonText={UIText.closeButtonText}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
