// import React, { useContext, createContext } from "react";
// import {
//   useMutation,
//   // ApolloProvider
// } from "@apollo/client";
// import { REFRESH_TOKEN } from "../mutations/userMutations";

// export const RefreshTokenMutationContext = createContext();

// // we have to use this wrapper because in the App.jsx file we can't use a mutation because the client has't been passed yet
// export default function TokenWrapper({
//   children,
//   setAccessTokenStorage,
//   setRefreshTokenStorage,
// }) {

//   return (
//     <RefreshTokenMutationContext.Provider value={getRefreshToken}>
//       {children}
//     </RefreshTokenMutationContext.Provider>
//   );
// }
