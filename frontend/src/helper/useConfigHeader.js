import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { useEffect, useState } from "react";

export const useConfigClient = () => {
  const [accessTokenStorage, setAccessTokenStorage] = useState(
    localStorage.getItem("accesstoken")
  ); // by default it is null

  const [refreshTokenStorage, setRefreshTokenStorage] = useState(
    localStorage.getItem("refreshtoken")
  ); // by default it is null

  // const accessTokenStorage = localStorage.getItem("accesstoken");
  // const refreshTokenStorage = localStorage.getItem("refreshtoken");

  // in order to avoid a warning
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          clients: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          projects: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  });

  console.log("accesstoken:", accessTokenStorage);
  console.log("refreshtoken:", refreshTokenStorage);

  const httpLink = createHttpLink({
    uri: "http://localhost:3000/graphql",
    headers: {
      //...headers,
      authorization: accessTokenStorage ? `Bearer ${accessTokenStorage}` : "",
      refreshtoken: refreshTokenStorage ? refreshTokenStorage : "",
    },
    // credentials: "include",
  });

  // const wsLink = new WebSocketLink({
  //   uri: config.GRAPHQL_WS,
  //   options: {
  //     reconnect: true,
  //     connectionParams: {
  //       headers: {
  //         authorization: `Bearer ${authTokenStorage}`,
  //       },
  //     },
  //   },
  // });

  // const link = split(
  //   ({ query }) => {
  //     const definition = getMainDefinition(query);
  //     return (
  //       definition.kind === "OperationDefinition" &&
  //       definition.operation === "subscription"
  //     );
  //   },
  //   wsLink,
  //   httpLink
  // );

  useEffect(() => {
    setAccessTokenStorage(localStorage.getItem("accesstoken")); // as soon as it is available just update the token
    setRefreshTokenStorage(localStorage.getItem("refreshtoken")); // as soon as it is available just update the token
  }, []);

  const client = new ApolloClient({
    cache,
    link: httpLink,
  });

  return client;
};
