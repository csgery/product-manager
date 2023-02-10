import React, { useState, createContext, useEffect } from "react";
import {
  InMemoryCache,
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  from,
} from "@apollo/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import DeletedProductsPage from "./pages/DeletedProductsPage";
import ProductPage from "./pages/ProductPage";
import UsersPage from "./pages/UsersPage";
import DeletedUsersPage from "./pages/DeletedUsersPage";
import UserPage from "./pages/UserPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import Navigation from "./components/Navigation";
import LogoutPage from "./pages/LogoutPage";
import ViewerPage from "./pages/ViewerPage";
import DictTest from "./components/DictTest";
import BadAuth from "./components/BadAuth";
// import { useConfigClient } from "./helper/useConfigHeader";
import { auth } from "./helper/helper";
import { onError } from "@apollo/client/link/error";
import TranslationWrapper from "./components/TranslationWrapper";
// import RefreshTokenPage from "./pages/RefreshTokenPage";
import { ReactNotifications } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import DeletedProductPage from "./pages/DeletedProductPage";
import DeletedUserPage from "./pages/DeletedUserPage";
import UsersPermissionsPage from "./pages/UsersPermissionsPage";
// import FAIDemo from "./components/FontAwesomeIcon_DEMO";
export const DarkModeContext = createContext();
export const LangContext = createContext();
export const IconModeContext = createContext();
export const TokensContext = createContext();

function App() {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkmode") === "true" ? true : false
  );
  const [iconMode, setIconMode] = useState(
    localStorage.getItem("iconMode") === "true" ? true : false
  );

  const checkPermsBeforeRoute = (
    permission,
    elementOnSuccess,
    userIdToView
  ) => {
    if (!auth.isAuthenticated()) {
      return <BadAuth />;
    }
    if (permission === "isAuthenticated") {
      //console.log("pathname:", window.location.pathname);
      return elementOnSuccess;
    }
    console.log(userIdToView);
    // we can't check this here, but in the components we can
    // if (
    //   permission === "isReadingOwnUser" &&
    //   auth.isReadingOwnUser(userIdToView)
    // ) {
    //   // if(!userIdToView) throw new Error('userIdToView is needed but given parameter is null!')
    //   return elementOnSuccess;
    // }
    if (auth.isSet(permission)) {
      return elementOnSuccess;
    }
    return <BadAuth />;
  };

  const handleDarkmodeChange = () => {
    localStorage.setItem("darkmode", !darkMode);
    setDarkMode(!darkMode);
  };

  const handleLangChange = (langParam) => {
    localStorage.setItem("lang", langParam);
    setLang(() => langParam);
  };

  const handleIconModeChange = (e) => {
    if (e) {
      e.stopPropagation();
    }
    localStorage.setItem("iconMode", !iconMode);
    setIconMode(!iconMode);
  };

  useEffect(() => {
    console.log("darkmode:", darkMode);
  });

  // because every request has checked at backend before gave to the backend's resolvers
  // the tokens'll be checked too
  // to prevent backends tokenvalidation errors if the token is invalid(if someone modified it inside localstorage)
  // check are tokens valid and if they're set to state
  const [accessTokenStorage, setAccessTokenStorage] = useState(() => {
    if (!auth.checkTokenIsValid()) {
      return null;
    } else {
      return localStorage.getItem("accesstoken");
    }
  }); // by default it is null

  const [refreshTokenStorage, setRefreshTokenStorage] = useState(() => {
    if (!auth.checkTokenIsValid()) {
      return null;
    } else {
      return localStorage.getItem("refreshtoken");
    }
  }); // by default it is null

  // in order to avoid a warning and later a potential error, implement the merge functions inside Query object
  const cache = new InMemoryCache({
    typePolicies: {
      User: { keyFields: ["id"] },
      Product: {
        keyFields: ["id"],
        // fields: {
        //   id: {
        //     // merge(existing, incoming, { mergeObjects }) {
        //     //   return mergeObjects(existing, incoming);
        //     // },
        //     merge: true,
        //   },
        //   name: {
        //     read(name) {
        //       return name.toUpperCase();
        //     },
        //   },
        // },
      },
      Query: {
        fields: {
          validProducts: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          deletedProducts: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          validUsers: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          deletedUsers: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  });

  // console.log("accesstoken:", accessTokenStorage);
  // console.log("refreshtoken:", refreshTokenStorage);

  const httpLink = createHttpLink({
    uri: import.meta.env.VITE_BACKEND_URI,
    headers: {
      //...headers,
      authorization: accessTokenStorage ? `Bearer ${accessTokenStorage}` : "",
      refreshtoken: refreshTokenStorage ? refreshTokenStorage : "",
      language: lang || "en",
    },
    // credentials: "include",
  });

  // useEffect(() => {
  //   setAccessTokenStorage(localStorage.getItem("accesstoken")); // as soon as it is available just update the token
  //   setRefreshTokenStorage(localStorage.getItem("refreshtoken")); // as soon as it is available just update the token
  // }, []);

  // const errorLink = onError(
  //   ({ graphQLErrors, networkError, operation, forward }) => {
  //     if (graphQLErrors) {
  //       for (let err of graphQLErrors) {
  //         console.log(err.extensions.code);
  //         switch (err.extensions.code) {
  //           // Apollo Server sets code to UNAUTHENTICATED
  //           // when an AuthenticationError is thrown in a resolver

  //           case "UNAUTHENTICATED":
  //             // Modify the operation context with a new token
  //             const oldHeaders = operation.getContext().headers;
  //             operation.setContext({
  //               headers: {
  //                 ...oldHeaders,
  //                 authorization: /*getNewToken()*/ "",
  //               },
  //             });
  //             // Retry the request, returning the new observable
  //             return forward(operation);
  //           //return;
  //         }
  //       }
  //     }
  //   }
  // );

  // const errorLink = onError(({ graphQLErrors, networkError }) => {
  //   if (graphQLErrors)
  //     graphQLErrors.forEach(({ message, locations, path }) =>
  //       console.log(
  //         `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
  //       )
  //     );
  //   if (networkError) console.log(`[Network error]: ${networkError}`);
  // });

  const client = new ApolloClient({
    cache,
    // link: from[(errorLink, httpLink)],
    link: httpLink,
  });

  // TODO: accestoken refreshtoken useState here!! and pass throuht these setters to the login component

  // const authLink = setContext((_, { headers }) => {
  //   // return the headers to the context so httpLink can read them
  //   return {
  //     headers: {
  //       ...headers,
  //       authorization: accesstoken ? `Bearer ${accesstoken}` : "",
  //       refreshtoken: refreshtoken ? refreshtoken : "",
  //     },
  //   };
  // });

  return (
    <ApolloProvider client={client}>
      <ReactNotifications />
      <TokensContext.Provider
        value={[setAccessTokenStorage, setRefreshTokenStorage]}
      >
        <DarkModeContext.Provider value={darkMode}>
          <LangContext.Provider value={lang}>
            <IconModeContext.Provider value={iconMode}>
              <TranslationWrapper>
                <Router>
                  <div
                    className={"App " + (darkMode ? "darkmode " : "lightmode ")}
                  >
                    <Navigation
                      handleLangChange={handleLangChange}
                      handleDarkmodeChange={handleDarkmodeChange}
                      handleIconModeChange={handleIconModeChange}
                    />
                    <div className="container mt-1 ">
                      <Routes>
                        <Route path="/products">
                          <Route
                            path=""
                            element={checkPermsBeforeRoute(
                              auth.PERMS.readValid_products,
                              <ProductsPage />
                            )}
                          />
                          <Route
                            path=":id"
                            element={checkPermsBeforeRoute(
                              auth.PERMS.readValid_products,
                              <ProductPage />
                            )}
                          />
                        </Route>
                        <Route path="/products/deleted">
                          <Route
                            path=""
                            element={checkPermsBeforeRoute(
                              auth.PERMS.readInvalid_products,
                              <DeletedProductsPage />
                            )}
                          />
                          <Route
                            path=":id"
                            element={checkPermsBeforeRoute(
                              auth.PERMS.readInvalid_products,
                              <DeletedProductPage />
                            )}
                          />
                        </Route>
                        <Route path="/users">
                          <Route
                            path=""
                            element={checkPermsBeforeRoute(
                              auth.PERMS.readValid_users,
                              <UsersPage />
                            )}
                          />
                          <Route
                            path=":id"
                            element={checkPermsBeforeRoute(
                              auth.PERMS.readValid_users, // the access needs to be validated in the UserPage (or related component)
                              <UserPage />
                            )}
                          />
                        </Route>
                        <Route path="users/deleted">
                          <Route
                            path=""
                            element={checkPermsBeforeRoute(
                              auth.PERMS.readInvalid_users,
                              <DeletedUsersPage />
                            )}
                          />
                          <Route
                            path=":id"
                            element={checkPermsBeforeRoute(
                              auth.PERMS.readInvalid_users, // the access needs to be validated in the UserPage (or related component)
                              <DeletedUserPage />
                            )}
                          />
                        </Route>
                        <Route
                          path="/permissions"
                          element={checkPermsBeforeRoute(
                            auth.PERMS.updateUser_permissions,
                            <UsersPermissionsPage />
                          )}
                        />
                        <Route
                          path="/viewer/:id"
                          element={checkPermsBeforeRoute(
                            auth.PERMS.readOwn_user,
                            <ViewerPage />
                          )}
                        />
                        <Route
                          path="/testdict"
                          element={checkPermsBeforeRoute("test", <DictTest />)}
                        />

                        {/* <Route
                path="/viewer/refreshtoken/:id"
                element={
                  <RefreshTokenPage
                    setAccessTokenStorage={setAccessTokenStorage}
                    setRefreshTokenStorage={setRefreshTokenStorage}
                  />
                }
              /> */}
                        <Route
                          path="/login"
                          element={
                            <LoginPage
                              setAccessTokenStorage={setAccessTokenStorage}
                              setRefreshTokenStorage={setRefreshTokenStorage}
                            />
                          }
                        />
                        {/*pass token setters to the login component*/}
                        <Route
                          path="/logout"
                          element={
                            <LogoutPage
                              setAccessTokenStorage={setAccessTokenStorage}
                              setRefreshTokenStorage={setRefreshTokenStorage}
                            />
                          }
                        />
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </div>
                  </div>
                </Router>
              </TranslationWrapper>
            </IconModeContext.Provider>
          </LangContext.Provider>
        </DarkModeContext.Provider>
      </TokensContext.Provider>
      {/* <nav class="navbar fixed-bottom bg-body-tertiary">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">
            Fixed bottom
          </a>
        </div>
      </nav> */}
      {/* <ProductsPage /> */}
    </ApolloProvider>
  );
}

export default App;
