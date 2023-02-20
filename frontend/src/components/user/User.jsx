import ProductUserModal from "../modals/ProductUserModal";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useContext } from "react";
import { UITextContext } from "../TranslationWrapper";
import { IconModeContext } from "../../App";
import { BsShieldShaded } from "react-icons/bs";
import { TbCrown } from "react-icons/tb";
import { TiCancel } from "react-icons/ti";
import {
  auth,
  defaultUserIMGPath as defaultIMGPath,
} from "../../helper/helper";

export default function User({
  user,
  showDeleteCBs = false,
  setDeleteCBChecked,
  setIdsNamesToDelete,
  cardBackgroundClass = "",
}) {
  const UIText = useContext(UITextContext);

  const iconMode = useContext(IconModeContext);

  const defaultUserIMGPath = "../../" + defaultIMGPath;

  const navigate = useNavigate();
  const [cbState, setCbState] = useState(false);
  const checkbox = useRef();

  // it looks like it's not re rendering, so we have to set to default the CB value
  // to restore the component's CB value to false (like after the first render)
  useEffect(() => {
    // if (
    //   !auth.isReadingOwnUser(user.id) &&
    //   !user.permissions.includes(auth.PERMS.owner) &&
    //   (!user.permissions.includes(auth.PERMS.protected) ||
    //     (user.permissions.includes(auth.PERMS.protected) &&
    //       auth.isSet(auth.PERMS.owner)))
    // ) {
    //   showDeleteCBs = true;
    // } else {
    //   showDeleteCBs = false;
    // }
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
      if (user.valid) {
        navigate(`/users/${user.id}`, { replace: true });
      } else {
        navigate(`/users/deleted/${user.id}`, { replace: true });
      }
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
    if (checkbox.current) {
      checkbox.current.checked = !checkbox.current.checked;
    }
    handleInputCBChange();
  };

  const handleInputCBChange = (e) => {
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
    //console.log(checkbox.current.checked);

    // if (checkbox.current.checked === "true")
    if (checkbox?.current?.checked) {
      //console.log("add id");
      setIdsNamesToDelete((oldIdsNamesToDelete) => [
        ...oldIdsNamesToDelete,
        [user.id, user.username, user.email],
      ]);
    } else {
      //console.log("delete id");
      setIdsNamesToDelete((oldIdsNamesToDelete) => {
        const modifiedValues = oldIdsNamesToDelete.filter(
          (item) => item[0] != user.id
        );
        return modifiedValues;
      });
    }
    // console.log("value:", e.target.value);
  };

  // console.log("USER:", user);
  return (
    <div
      className={"card mx-1 px-01 mb-2 product " + cardBackgroundClass}
      style={{ width: "18rem" }}
    >
      <div
        className="card-body"
        // if it's (protected or the own account) than showDeleteCBs = false (by useEffect) and we should disable doubleClick navigation because if we in showDeleteCBs state (select items for delete,remove,etc.) doubleclick not selecting this protected or own item but navigate to UserShowInfo, so it did't work as expected
        onDoubleClick={!showDeleteCBs ? handleNavigate : () => {}} // to prevent an error we have to pass an empty callback on false
        onClick={handleClick}
      >
        {showDeleteCBs &&
          !auth.isReadingOwnUser(user.id) &&
          !user.permissions.includes(auth.PERMS.owner) &&
          (!user.permissions.includes(auth.PERMS.protected) ||
            (user.permissions.includes(auth.PERMS.protected) &&
              auth.isSet(auth.PERMS.owner))) && (
            <input
              type="checkbox"
              id="deleteCB"
              value={!cbState}
              onChange={handleInputCBChange}
              onClick={(e) => stopPropagation(e)}
              defaultChecked={setDeleteCBChecked}
              ref={checkbox}
            />
          )}
        <img
          id="imgFrame"
          src={user.image || defaultUserIMGPath}
          className="img-fluid mb-2"
          style={{ maxWidth: "200px" }}
        />
        <h5 className="card-title">
          {auth.isSet(auth.PERMS.updateUser_permissions) ? (
            <>
              <span className={!user.canLogin ? "text-danger" : "text-dark"}>
                {user.username}
              </span>
              {!user.canLogin && (
                <TiCancel
                  data-toggle="tooltip"
                  data-placement="top"
                  title={UIText.blocked}
                  className="align-middle text-center text-danger "
                  style={{ fontSize: "1.9rem", marginBottom: "2px" }}
                />
              )}
              {user.permissions.includes(auth.PERMS.protected) && (
                <BsShieldShaded
                  data-toggle="tooltip"
                  data-placement="top"
                  title={UIText.protected}
                  className="ms-1 align-middle text-success"
                  style={{ fontSize: "1.3rem", marginBottom: "3px" }}
                />
              )}

              {user.permissions.includes(auth.PERMS.owner) && (
                <TbCrown
                  data-toggle="tooltip"
                  data-placement="top"
                  title={UIText.owner}
                  className="ms-1 text-warning"
                  style={{ fontSize: "1.8rem", marginBottom: "3px" }}
                />
              )}
            </>
          ) : (
            <>{user.username}</>
          )}
        </h5>
        <h6 className="card-subtitle mb-2 ">{user.email}</h6>

        {!showDeleteCBs && (
          <>
            {user.valid ? (
              auth.isSet(auth.PERMS.delete_user) &&
              !auth.isReadingOwnUser(user.id) &&
              !user.permissions.includes(auth.PERMS.owner) &&
              (!user.permissions.includes(auth.PERMS.protected) ||
                (user.permissions.includes(auth.PERMS.protected) &&
                  auth.isSet(auth.PERMS.owner))) && (
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
              )
            ) : (
              <>
                {auth.isSet(auth.PERMS.remove_user) &&
                  !auth.isReadingOwnUser(user.id) &&
                  !user.permissions.includes(auth.PERMS.owner) &&
                  (!user.permissions.includes(auth.PERMS.protected) ||
                    (user.permissions.includes(auth.PERMS.protected) &&
                      auth.isSet(auth.PERMS.owner))) && (
                    <ProductUserModal
                      bind="user"
                      iconMode={iconMode}
                      itemIdsNamesToProcess={[
                        [user.id, user.username, user.email],
                      ]}
                      areThereMultipleProducts={false}
                      modalType="Remove"
                      deleteBTNClass="btn btn-danger p-2 me-2"
                      didItemComeFromItself={true}
                      modalTitle={UIText.removeUserTitle}
                      modalText={UIText.removeUserText}
                      modalButtonText={UIText.removeButtonText}
                      modalCloseButtonText={UIText.closeButtonText}
                    />
                  )}
                {auth.isSet(auth.PERMS.restore_user) &&
                  !auth.isReadingOwnUser(user.id) &&
                  !user.permissions.includes(auth.PERMS.owner) &&
                  (!user.permissions.includes(auth.PERMS.protected) ||
                    (user.permissions.includes(auth.PERMS.protected) &&
                      auth.isSet(auth.PERMS.owner))) && (
                    <ProductUserModal
                      bind="user"
                      iconMode={iconMode}
                      itemIdsNamesToProcess={[
                        [user.id, user.username, user.email],
                      ]}
                      areThereMultipleProducts={false}
                      modalType="Restore"
                      deleteBTNClass="btn btn-danger p-2 me-2"
                      didItemComeFromItself={true}
                      modalTitle={UIText.restoreUserTitle}
                      modalText={UIText.restoreUserText}
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
  );
}
