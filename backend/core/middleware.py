from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
import graphene
from .schema import Mutation, Query

class RefreshTokenMiddleware(MiddlewareMixin):
    def process_request(self, request):
        try:
            if request.COOKIES.get("JWT-Refresh-token") is None:
                return None
            if request.path == "/logout/":
                return
            schema = graphene.Schema(mutation=Mutation)
            result = schema.execute(
                '''
                    mutation {
                        refreshToken(refreshToken: "'''
                + request.COOKIES.get("JWT-Refresh-token")
                + """")
                                {
                                    token
                                    refreshToken
                                    success
                                    errors
                                    }
                                }
                            """
            )
            
            if result.errors:
                print("GraphQL errors:", result.errors)
                return
            
            refresh_data = result.data.get("refreshToken")
            if refresh_data and refresh_data.get("success"):
                # Pobierz nowy token i refresh token
                request.jwt_token = refresh_data.get("token")
                request.refresh_token = refresh_data.get("refreshToken")
                print("Nowy JWT token:", request.jwt_token)
                print("Nowy Refresh token:", request.refresh_token)
            else:
                print("Błąd odświeżania tokena:", refresh_data.get("errors"))
        except Exception as e:
            print(e)


    def process_response(self, request, response):
                # Ustawienie nowych tokenów w ciasteczkach (jeśli są)
        if hasattr(request, 'jwt_token'):
            response.set_cookie('JWT', request.jwt_token, httponly=True, path='/')
        if hasattr(request, 'refresh_token'):
            response.set_cookie('JWT-Refresh-token', request.refresh_token, httponly=True, path='/')

        # Usuwanie ciasteczek po wylogowaniu
        if hasattr(request, 'delete_jwt_cookies') and request.delete_jwt_cookies:
            response.delete_cookie('JWT')

            response.delete_cookie('JWT-Refresh-token')
        return response