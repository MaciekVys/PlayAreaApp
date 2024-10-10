// import {
//   ApolloClient,
//   InMemoryCache,
//   HttpLink,
//   ApolloLink,
// } from "@apollo/client";
// import { onError } from "@apollo/client/link/error";
// import jwtDecode from "jwt-decode";
// import { setContext } from "@apollo/client/link/context";

// // Funkcja do sprawdzania czy token wygasł
// function isTokenExpired(token) {
//   if (!token) return true;
//   try {
//     const { exp } = jwtDecode(token);
//     if (Date.now() >= exp * 1000) {
//       return true;
//     }
//     return false;
//   } catch (error) {
//     return true;
//   }
// }

// // Funkcja do uzyskania odświeżonego tokenu
// async function refreshAccessToken() {
//   const refreshToken = getCookie("JWT-Refresh-token"); // Zakładam, że masz funkcję, która odczytuje ciasteczko
//   if (!refreshToken) {
//     console.error(
//       "Brak refresh tokena, użytkownik musi się ponownie zalogować."
//     );
//     return null;
//   }

//   // Mutacja GraphQL do odświeżenia tokenu
//   const response = await fetch("/graphql/", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       query: `
//         mutation {
//           refreshToken(refreshToken: "${refreshToken}") {
//             token
//             success
//             errors
//           }
//         }
//       `,
//     }),
//   });

//   const data = await response.json();
//   if (data.data.refreshToken.success) {
//     document.cookie = `JWT=${data.data.refreshToken.token}; path=/; httponly; samesite=strict`;
//     return data.data.refreshToken.token;
//   } else {
//     console.error(
//       "Nie udało się odświeżyć tokenu:",
//       data.data.refreshToken.errors
//     );
//     return null;
//   }
// }

// // Ustawienie kontekstu autoryzacji
// const authLink = setContext(async (_, { headers }) => {
//   let token = getCookie("JWT"); // Zakładam, że masz funkcję do odczytu ciasteczka z access tokenem

//   // Sprawdź, czy token wygasł, jeśli tak, odśwież go
//   if (isTokenExpired(token)) {
//     token = await refreshAccessToken();
//   }

//   return {
//     headers: {
//       ...headers,
//       Authorization: token ? `JWT ${token}` : "",
//     },
//   };
// });

// // Link do obsługi błędów, np. 401 Unauthorized
// const errorLink = onError(
//   ({ graphQLErrors, networkError, operation, forward }) => {
//     if (graphQLErrors) {
//       for (let err of graphQLErrors) {
//         if (err.extensions?.code === "UNAUTHENTICATED") {
//           return fromPromise(
//             refreshAccessToken().then((newToken) => {
//               if (newToken) {
//                 // Update operation context with new token
//                 operation.setContext(({ headers = {} }) => ({
//                   headers: {
//                     ...headers,
//                     Authorization: `JWT ${newToken}`,
//                   },
//                 }));
//                 return forward(operation);
//               }
//               return;
//             })
//           ).flatMap((result) => (result ? forward(operation) : []));
//         }
//       }
//     }
//     if (networkError) console.log(`[Network error]: ${networkError}`);
//   }
// );

// // HttpLink - link do serwera GraphQL
// const httpLink = new HttpLink({
//   uri: "http://localhost:8000/graphql/",
// });

// // Apollo Client
// const client = new ApolloClient({
//   link: ApolloLink.from([authLink, errorLink, httpLink]),
//   cache: new InMemoryCache(),
// });
