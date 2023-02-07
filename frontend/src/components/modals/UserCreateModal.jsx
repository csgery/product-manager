import { useState, useContext } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_USER } from "../../mutations/userMutations";
import { GET_VALIDUSERS } from "../../queries/userQueries";
import { Button, Modal } from "react-bootstrap";
import useCustomError from "../../helper/hooks/useCustomError";
import { DarkModeContext } from "../../App";
import { GrAdd } from "react-icons/gr";
import { MdOutlineDoneOutline, MdOutlineCancel } from "react-icons/md";
import { createNotification } from "../../helper/helper";

import { UITextContext } from "../TranslationWrapper";
import { IconModeContext } from "../../App";
import {
  validateUserEmailInput,
  validateUserUsernameInput,
} from "../../helper/helper";

export default function UserCreateModal() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [show, setShow] = useState(false);
  const password = "testPassword!1";

  const darkMode = useContext(DarkModeContext);
  const UIText = useContext(UITextContext);

  const [handleCustomError] = useCustomError();

  const iconMode = useContext(IconModeContext);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [addUser, { data }] = useMutation(CREATE_USER, {
    variables: { username, email, password },
    update(cache, { data: { data } }) {
      const { validUsers } = cache.readQuery({ query: GET_VALIDUSERS });
      console.log("addUser:", addUser);
      cache.writeQuery({
        query: GET_VALIDUSERS,
        data: { validUsers: [...validUsers, addUser] },
      });
    },
  });

  const handleUsernameChange = (value) => {
    value = validateUserUsernameInput(value, UIText);
    setUsername(value);
  };

  const handleEmailChange = (value) => {
    value = validateUserEmailInput(value, UIText);
    setEmail(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === "" || email === "") {
      // error = true;
      return createNotification({
        title: UIText.warning,
        message: UIText.fillOutAllField,
        type: "warning",
      });
    }

    if (username.length < 5) {
      return createNotification({
        title: UIText.error,
        message: UIText.usernameTooShort,
        type: "warning",
      });
    }
    if (username.length > 32) {
      return createNotification({
        title: UIText.error,
        message: UIText.usernameTooLong,
        type: "warning",
      });
    }

    addUser(username, email, password)
      .then(() => {
        setUsername("");
        setEmail("");
        handleClose();
        createNotification({
          title: UIText.successfulOperation,
          message: UIText.successfullyCreated,
          type: "success",
        });
      })
      .catch((err) => {
        handleCustomError(err);
      });
  };

  return (
    <>
      <Button className="btn btn-light p-2 ms-1 me-2 mb-2" onClick={handleShow}>
        {iconMode ? (
          <GrAdd style={{ fontSize: "1.6rem" }} />
        ) : (
          UIText.createUserButtonText
        )}
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton className={darkMode && "bg-dark text-white"}>
          <Modal.Title>{UIText.createUserButtonText}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode && "bg-dark text-white"}>
          <div className="mb-3">
            <label className="form-label">{UIText.username}</label>
            <input
              type="text"
              className="form-control"
              id="username"
              onChange={(e) => handleUsernameChange(e.target.value)}
              value={username}
            />
          </div>
          <div className="mb-3 danger">
            <label className="form-label ">Email</label>
            <input
              type="text"
              className="form-control"
              id="email"
              onChange={(e) => handleEmailChange(e.target.value)}
              value={email}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className={darkMode && "bg-dark text-white"}>
          <Button variant="danger" onClick={handleClose}>
            {iconMode ? (
              <MdOutlineCancel style={{ fontSize: "1.6rem" }} />
            ) : (
              UIText.closeButtonText
            )}
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {iconMode ? (
              <MdOutlineDoneOutline style={{ fontSize: "1.6rem" }} />
            ) : (
              UIText.createButtonText
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
