import ProductUserModal from "./modals/ProductUserModal";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { TbTrash, TbTrashOff } from "react-icons/tb";
import { UITextContext } from "./TranslationWrapper";
import { IconModeContext } from "../App";

import { LangContext } from "../App";

export default function User({
  user,
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
    if (!showDeleteCBs) navigate(`/users/${user.id}`, { replace: true });
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
        [user.id, user.username, user.email],
      ]);
    } else {
      console.log("delete id");
      setIdsNamesToDelete((oldIdsNamesToDelete) => {
        const modifiedValues = oldIdsNamesToDelete.filter(
          (item) => item[0] != user.id
        );
        return modifiedValues;
      });
    }
    // console.log("value:", e.target.value);
  };

  return (
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
        <h5 className="card-title">{user.username}</h5>
        <h6 className="card-subtitle mb-2 ">{user.email}</h6>

        {!showDeleteCBs && (
          <>
            {user.valid ? (
              <ProductUserModal
                bind="user"
                iconMode={iconMode}
                itemIdsNamesToProcess={[[user.id, user.username, user.email]]}
                areThereMultipleProducts={false}
                modalType="Delete"
                deleteBTNClass="btn btn-danger p-2 me-2"
                didItemComeFromItself={true}
                modalTitle={UIText.deleteUserTitle}
                modalText={UIText.deleteUserText}
                modalButtonText={UIText.deleteButtonText}
                modalCloseButtonText={UIText.closeButtonText}
              />
            ) : (
              <>
                <ProductUserModal
                  bind="user"
                  iconMode={iconMode}
                  itemIdsNamesToProcess={[[user.id, user.username, user.email]]}
                  areThereMultipleProducts={false}
                  modalType="Remove"
                  deleteBTNClass="btn btn-danger p-2 me-2"
                  didItemComeFromItself={true}
                  modalTitle={UIText.removeUserTitle}
                  modalText={UIText.removeUserText}
                  modalButtonText={UIText.removeButtonText}
                  modalCloseButtonText={UIText.closeButtonText}
                />
                <ProductUserModal
                  bind="user"
                  iconMode={iconMode}
                  itemIdsNamesToProcess={[[user.id, user.username, user.email]]}
                  areThereMultipleProducts={false}
                  modalType="Restore"
                  deleteBTNClass="btn btn-danger p-2 me-2"
                  didItemComeFromItself={true}
                  modalTitle={UIText.restoreUserTitle}
                  modalText={UIText.restoreUserText}
                  modalButtonText={UIText.restoreButtonText}
                  modalCloseButtonText={UIText.closeButtonText}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
