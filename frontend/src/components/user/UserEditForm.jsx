import React from "react";
import { useState, useEffect, useRef, useContext } from "react";
import { useMutation } from "@apollo/client";
import { GET_VALIDUSERS } from "../../queries/userQueries";
import { UPDATE_USER } from "../../mutations/userMutations";
import {
  createNotification,
  validateUserEmailInput,
} from "../../helper/helper";
import useCustomError from "../../helper/hooks/useCustomError";
import { UITextContext } from "./../TranslationWrapper";
import { GrClose, GrCheckmark } from "react-icons/gr";
import { MdOutlineDoneOutline, MdOutlineCancel } from "react-icons/md";

const UserEditForm = ({ user, setToggleEditForm, iconMode }) => {
  //const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [handleCustomError] = useCustomError();

  const UIText = useContext(UITextContext);

  const [updateUser] = useMutation(UPDATE_USER, {
    variables: { id: user.id, email },
    // in order to refresh the data on the screen after update
    refetchQueries: [{ query: GET_VALIDUSERS }],
  });

  useEffect(() => {
    focus();
  }, []);

  const focusRef = useRef(null);

  const handleEmailChange = (value) => {
    value = validateUserEmailInput(value, UIText);
    setEmail(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === "") {
      // error = true;
      return createNotification({
        title: UIText.warning,
        message: UIText.fillOutAllField,
        type: "warning",
      });
    }

    updateUser(email)
      .then(() => {
        // successful notification message
        createNotification({
          title: UIText.successfulOperation,
          message: UIText.successfullyUpdated,
          type: "success",
        });

        // close modification form
        setToggleEditForm(false);
      })
      .catch((err) => {
        handleCustomError(err);
      });
  };

  const focus = () => {
    //focusRef.current.focus();
    focusRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEditBTNDisabling = () => {
    if (email === user.email) {
      return true;
    }
    return false;
  };

  return (
    <div className="mt-4 mb-4 w-75 mx-auto">
      <h3>{UIText.productFormTitle}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            ref={focusRef}
            type="text"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn-danger "
          onClick={() => setToggleEditForm(false)}
        >
          {iconMode ? (
            <MdOutlineCancel style={{ fontSize: "1.6rem" }} />
          ) : (
            UIText.cancelButtonText
          )}
        </button>
        <button
          type="submit"
          className="btn btn-primary ms-1 "
          disabled={handleEditBTNDisabling()}
        >
          {iconMode ? (
            <MdOutlineDoneOutline style={{ fontSize: "1.6rem" }} />
          ) : (
            UIText.editButtonText
          )}
        </button>
      </form>
    </div>
  );
};

export default UserEditForm;
