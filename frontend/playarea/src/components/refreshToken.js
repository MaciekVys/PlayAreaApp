// import { gql } from "@apollo/client";
// import { useMutation } from "@apollo/client";
// import Cookies from "js-cookie";
// import {
//   ApolloClient,
//   InMemoryCache,
//   ApolloLink,
//   HttpLink,
//   from,
// } from "@apollo/client";
// import { onError } from "@apollo/client/link/error";
// import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

// export const REFRESH_TOKEN_MUTATION = gql`
//   mutation RefreshToken($refreshToken: String!) {
//     refreshToken(refreshToken: $refreshToken) {
//       token
//       refreshToken
//       success
//     }
//   }
// `;

// const useRefreshToken = () => {
//   const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);

//   const refreshAuthToken = async () => {
//     const refreshToken = Cookies.get("JWT-Refresh-token");

//     if (!refreshToken) {
//       throw new Error("Brak refresh tokenu w ciasteczkach");
//     }

//     const response = await refreshTokenMutation({
//       variables: { refreshToken },
//     });

//     if (response.data?.refreshToken?.success) {
//       const newToken = response.data.refreshToken.token;
//       const newRefreshToken = response.data.refreshToken.refreshToken;

//       // Zapisanie nowych tokenów w ciasteczkach
//       Cookies.set("JWT", newToken, { sameSite: "Lax", secure: true });
//       Cookies.set("JWT-Refresh-token", newRefreshToken, {
//         sameSite: "Lax",
//         secure: true,
//       });

//       return newToken;
//     } else {
//       throw new Error("Nie udało się odświeżyć tokenu");
//     }
//   };

//   return refreshAuthToken;
// };
// export default useRefreshToken;

// const httpLink = createUploadLink({
//   uri: "http://localhost:8000/graphql/",
//   credentials: "include",
// });

// const authLink = new ApolloLink((operation, forward) => {
//   const token = Cookies.get("JWT");

//   operation.setContext({
//     headers: {
//       authorization: token ? `Bearer ${token}` : "",
//     },
//   });

//   return forward(operation);
// });

// const errorLink = onError(({ graphQLErrors, operation, forward }) => {
//   const refreshAuthToken = useRefreshToken();

//   if (graphQLErrors) {
//     for (let err of graphQLErrors) {
//       if (err.extensions.code === "UNAUTHENTICATED") {
//         return refreshAuthToken()
//           .then((newToken) => {
//             operation.setContext({
//               headers: {
//                 authorization: `Bearer ${newToken}`,
//               },
//             });
//             return forward(operation);
//           })
//           .catch((error) => {
//             console.error("Błąd odświeżania tokenu:", error);
//             Cookies.remove("JWT");
//             Cookies.remove("JWT-Refresh-token");
//           });
//       }
//     }
//   }
// });

// const client = new ApolloClient({
//   link: from([authLink, errorLink, httpLink]),
//   cache: new InMemoryCache(),
//   credentials: "include",
// });

// export default client;
