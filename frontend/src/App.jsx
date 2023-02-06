// import dotenv from "dotenv";
// dotenv.config();
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
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import Navigation from "./components/Navigation";
import LogoutPage from "./pages/LogoutPage";
import ViewerPage from "./pages/ViewerPage";
import DictTest from "./components/DictTest";
import { useConfigClient } from "./helper/useConfigHeader";
import { onError } from "@apollo/client/link/error";
import TokenWrapper from "./pages/TokenWrapper";
import TranslationWrapper from "./components/TranslationWrapper";
// import RefreshTokenPage from "./pages/RefreshTokenPage";
import { ReactNotifications } from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
// import FAIDemo from "./components/FontAwesomeIcon_DEMO";
export const DarkModeContext = createContext();
export const LangContext = createContext();
export const IconModeContext = createContext();

function App() {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkmode") === "true" ? true : false
  );
  const [iconMode, setIconMode] = useState(
    localStorage.getItem("iconMode") === "true" ? true : false
  );

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

  const [accessTokenStorage, setAccessTokenStorage] = useState(
    localStorage.getItem("accesstoken")
  ); // by default it is null

  const [refreshTokenStorage, setRefreshTokenStorage] = useState(
    localStorage.getItem("refreshtoken")
  ); // by default it is null

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
      <TokenWrapper
        setAccessTokenStorage={setAccessTokenStorage}
        setRefreshTokenStorage={setRefreshTokenStorage}
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
                          <Route path="" element={<ProductsPage />} />
                          <Route path=":id" element={<ProductPage />} />
                          <Route
                            path="deleted"
                            element={<DeletedProductsPage />}
                          />
                        </Route>
                        <Route path="/viewer/:id" element={<ViewerPage />} />
                        <Route path="/testdict" element={<DictTest />} />

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
      </TokenWrapper>
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
