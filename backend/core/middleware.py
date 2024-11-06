# from django.utils.deprecation import MiddlewareMixin
# from django.http import JsonResponse
# import graphene
# from .schema import Mutation, Query

# class RefreshTokenMiddleware(MiddlewareMixin):
#     def process_request(self, request):
#         # Flaga kontrolna, aby uniknąć zapętlenia
#         if hasattr(request, '_jwt_was_refreshed'):
#             return None

#         # Sprawdź obecność JWT i refresh tokena w ciasteczkach
#         jwt_token = request.COOKIES.get("JWT")
#         refresh_token = request.COOKIES.get("JWT-refresh-token")

#         # Jeśli refresh token jest nieobecny, usuń JWT i zablokuj dostęp
#         if jwt_token and not refresh_token:
#             response = JsonResponse({"error": "Authentication credentials were not provided or expired."}, status=403)
#             response.delete_cookie("JWT")
#             response.delete_cookie("JWT-refresh-token")
#             return response

#         # Jeśli brak JWT, ale istnieje refresh token, wykonaj odświeżenie tokenu
#         if jwt_token is None and refresh_token:
#             try:
#                 # Utwórz schemat GraphQL
#                 schema = graphene.Schema(mutation=Mutation, query=Query)
#                 # Wykonaj mutację refreshToken
#                 result = schema.execute(
#                     '''
#                     mutation($refreshToken: String!) {
#                         refreshToken(refreshToken: $refreshToken) {
#                             token
#                         }
#                     }
#                     ''',
#                     variables={"refreshToken": refresh_token},
#                     context_value={'request': request}
#                 )

#                 # Sprawdź, czy uzyskano nowy JWT
#                 if result and result.data and result.data.get("refreshToken"):
#                     new_jwt_token = result.data["refreshToken"]["token"]
#                     request.COOKIES['JWT'] = new_jwt_token
#                     response = self.get_response(request)
#                     response.set_cookie(
#                         'JWT',
#                         new_jwt_token,
#                         httponly=True,
#                         secure=True,  # Zmień na False dla testów lokalnych
#                         samesite='Lax'
#                     )
                    
#                     # Oznacz żądanie jako odświeżone
#                     request._jwt_was_refreshed = True
#                     return response

#             except Exception as e:
#                 print(f"Błąd odświeżania tokenu: {e}")

#         # Jeśli JWT jest obecne lub zostało odświeżone, kontynuuj normalne przetwarzanie
#         return self.get_response(request)