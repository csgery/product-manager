import { useState, useContext, useRef } from "react";
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
  defaultUserIMGPath,
  handleIMGChange,
} from "../../helper/helper";

export default function UserCreateModal() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [show, setShow] = useState(false);
  const [IMGFrame, setIMGFrame] = useState(defaultUserIMGPath);
  const [imgFile, setImgFile] = useState(null);
  const [IMGBase64, setIMGBase64] = useState("");
  const password = import.meta.env.VITE_DEFAULT_USERPASSWORD;

  const darkMode = useContext(DarkModeContext);
  const UIText = useContext(UITextContext);

  const [handleCustomError] = useCustomError();

  const imgInputRef = useRef(null);

  const iconMode = useContext(IconModeContext);

  const [addUser, { data }] = useMutation(CREATE_USER, {
    update(cache, { data: { data } }) {
      const { validUsers } = cache.readQuery({ query: GET_VALIDUSERS });
      console.log("addUser:", addUser);
      cache.writeQuery({
        query: GET_VALIDUSERS,
        data: { validUsers: [...validUsers, addUser] },
      });
    },
  });

  const handleClose = () => {
    setUsername("");
    setEmail("");
    setIMGFrame(defaultUserIMGPath);
    setIMGBase64("");
    setShow(false);
  };

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

    addUser({ variables: { username, email, password, image: IMGBase64 } })
      .then(() => {
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

  const clearIMG = () => {
    document.getElementById("formFile").value = null;
    setIMGFrame(defaultUserIMGPath);
    setIMGBase64("");
  };

  const previewIMG = (e) => {
    setIMGFrame(URL.createObjectURL(e.target.files[0]));
  };

  const handleIMGDrop = (e) => {
    e.preventDefault();
    e.target.files = e.dataTransfer.files;
    const successfulIMGChange = handleIMGChange(
      e,
      previewIMG,
      setIMGBase64,
      UIText
    );
    if (successfulIMGChange) {
      setImgFile(e.dataTransfer.files);
      imgInputRef.current.files = e.dataTransfer.files;
    }
  };

  return (
    <>
      <Button
        className="btn btn-light p-2 ms-1 me-2 mb-2"
        onClick={() => setShow(true)}
      >
        {iconMode ? (
          <GrAdd style={{ fontSize: "1.6rem" }} />
        ) : (
          UIText.createUserButtonText
        )}
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton className={darkMode && "bg-dark text-white"}>
          <Modal.Title>{UIText.createUserButtonText}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode && "bg-dark text-white"}>
          <div className="mb-5">
            <img
              id="imgFrame"
              src={IMGFrame}
              className="img-fluid"
              onDrop={(e) => handleIMGDrop(e)}
              onDragOver={(e) => e.preventDefault()}
            />
            <button onClick={clearIMG} className="btn btn-primary mt-3">
              Clear IMG
            </button>
            <input
              className="form-control"
              type="file"
              id="formFile"
              onChange={(e) => {
                const successfulIMGChange = handleIMGChange(
                  e,
                  previewIMG,
                  setIMGBase64,
                  UIText
                );
                if (successfulIMGChange) {
                  setImgFile(e.dataTransfer.files);
                  imgInputRef.current.files = e.dataTransfer.files;
                } else {
                  // we have to set the previous img file or the input value will be null
                  imgInputRef.current.files = imgFile; // previous img file
                }
              }}
              ref={imgInputRef}
            />
          </div>

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
          <Button variant="danger" onClick={() => setShow(false)}>
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
