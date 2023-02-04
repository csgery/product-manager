import React, { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { REFRESH_TOKEN } from "../mutations/userMutations";
import { getUserId } from "../helper/helper";
import { useNavigate } from "react-router-dom";

export default function RefreshTokenPage({
  setAccessTokenStorage,
  setRefreshTokenStorage,
}) {
  const navigate = useNavigate();
  const [getRefreshToken, { loading, error, data }] = useMutation(
    REFRESH_TOKEN,
    {
      onCompleted: (data) => {
        // localStorage.clear();
        localStorage.removeItem("accesstoken");
        localStorage.removeItem("refreshtoken");
        localStorage.setItem("accesstoken", data.refreshToken[0]);
        localStorage.setItem("refreshtoken", data.refreshToken[1]);
        setAccessTokenStorage(localStorage.getItem("accesstoken"));
        setRefreshTokenStorage(localStorage.getItem("refreshtoken"));
        const id = getUserId();
        console.log("success", data);

        // TODO:it will destroy the data which the user working on so it is not a good way to refresh the tokens (if a user is filling a formatPostcssSourceMap, the whole data will be ereased because the whole UI rerendering...)

        //navigate(`/viewer/${id}replacedAccessToken`, { replace: true });
      },
    }
  );
  useEffect(() => {
    getRefreshToken();
  }, []);

  if (!loading && !error && data) {
  }

  return <></>;
}
