import React, { useContext, createContext } from "react";
import {
  useMutation,
  // ApolloProvider
} from "@apollo/client";
import { REFRESH_TOKEN } from "../mutations/userMutations";

export const RefreshTokenMutationContext = createContext();

// we have to use this wrapper because in the App.jsx file we can't use a mutation because the client has't been passed yet
export default function TokenWrapper({
  children,
  setAccessTokenStorage,
  setRefreshTokenStorage,
}) {
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
        //const id = getUserId();
        console.log("successful token refresh from wrapper", data);

        // TODO:it will destroy the data which the user working on so it is not a good way to refresh the tokens (if a user is filling a formatPostcssSourceMap, the whole data will be ereased because the whole UI rerendering...)

        //navigate(`/viewer/${id}replacedAccessToken`, { replace: true });
      },
    }
  );

  // apply the mutation context
  return (
    <RefreshTokenMutationContext.Provider value={getRefreshToken}>
      {children}
    </RefreshTokenMutationContext.Provider>
  );
}
