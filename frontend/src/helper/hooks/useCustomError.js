import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { REFRESH_TOKEN } from "../../mutations/userMutations";
import { TokensContext } from "../../App";
import { UITextContext } from "../../components/TranslationWrapper";
import {
  createNotification,
  getErrorMessageCode,
  userErrorCodes,
  productErrorCodes,
} from "../helper";

function useCustomError() {
  const navigate = useNavigate();
  const [setAccessTokenStorage, setRefreshTokenStorage] =
    useContext(TokensContext);
  const UIText = useContext(UITextContext);
  const [getRefreshToken, { loading, error, data }] = useMutation(
    REFRESH_TOKEN,
    {
      onCompleted: (data) => {
        // localStorage.clear();

        localStorage.removeItem("accesstoken");
        localStorage.removeItem("refreshtoken");
        localStorage.setItem("accesstoken", data.refreshToken[0]);
        localStorage.setItem("refreshtoken", data.refreshToken[1]);
        // it is a state changing, the whole page'll refresh and if the user working on a form the data will be erased
        setAccessTokenStorage(localStorage.getItem("accesstoken"));
        setRefreshTokenStorage(localStorage.getItem("refreshtoken"));
        //const id = getUserId();
        console.log("successful token refresh from wrapper", data);

        // TODO:it will destroy the data which the user working on so it is not a good way to refresh the tokens (if a user is filling a form, the whole data will be ereased because the whole UI rerendering...)

        //navigate(`/viewer/${id}replacedAccessToken`, { replace: true });
      },
    }
  );

  const handleCustomError = (error) => {
    // !!!!USAGE: first implement if statements for specific error cases (like where we have to redirect the user or something) after that just give the data to the createNotification() method

    // error: error object
    //console.log(error);
    const { message, code } = getErrorMessageCode(error.message);
    //console.log(`message, code: ${message} ${code}`);

    // if there is no message that means the error is not our customerror (its maybe other server error)
    if (!message) {
      //throw error;
      // try to handle this situation down in createNotification() method
    }
    //console.log("after separate message and code");
    // if there is message then there'll be code too
    if (code === userErrorCodes.userLoginFirst) {
      navigate("/login", { replace: true });
    }
    if (
      code === userErrorCodes.userShouldReLogin ||
      code === userErrorCodes.userExpiredRefreshJWT ||
      code === userErrorCodes.userInvalidAccessJWT ||
      code === userErrorCodes.userInvalidRefreshJWT
    ) {
      // redirect to logout, where all client side data will be removed and will be redirected to login
      navigate("/logout", { replace: true });
    }

    if (code === userErrorCodes.userExpiredAccessJWT) {
      getRefreshToken();
      //navigate(`/viewer/refreshtoken/${getUserId()}`);
    }
    // if (code === productErrorCodes.productExistedShortID) {
    //   console.log("existed shortID, firing notification...");
    //   createNotification({
    //     title: "Error!",
    //     message: message,
    //     type: "danger",
    //   });
    // }
    createNotification({
      title: UIText.error,
      message: message || error.message, // if the error wasn't our custom error
      type: "danger",
    });
    // return code (?) -> for better error handling (if code === something than focus on affected field)
  };

  return [handleCustomError];
}

export default useCustomError;
