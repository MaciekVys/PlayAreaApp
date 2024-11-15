from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
import graphene
from core.schema import Mutation, Query

class RefreshTokenMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Jeśli token został już odświeżony w ramach tego żądania, nic nie rób
        if hasattr(request, '_jwt_was_refreshed'):
            return None

        # Pobranie JWT i refresh tokena z ciasteczek
        jwt_token = request.COOKIES.get("JWT")
        refresh_token = request.COOKIES.get("JWT-Refresh-token")

        # Logowanie stanu początkowego
        print(f"JWT Token: {jwt_token}")
        print(f"Refresh Token: {refresh_token}")

        # Jeśli JWT istnieje i jest ważny, kontynuuj bez zmian
        if jwt_token:
            request.jwt_token = jwt_token
            return None

        # Jeśli JWT nie istnieje, ale jest refresh token, spróbuj odświeżyć token
        if refresh_token:
            try:
                # Tworzenie schematu z użyciem Query oraz Mutation
                schema = graphene.Schema(query=Query, mutation=Mutation)
                print("Próba odświeżenia tokenu za pomocą refresh tokena...")

                # Wykonanie mutacji odświeżenia tokena
                result = schema.execute(
                    '''
                    mutation {
                        refreshToken(refreshToken: "''' + refresh_token + '''") {
                            token
                            refreshToken
                            success
                            errors
                        }
                    }
                    '''
                )

                # Sprawdzenie, czy mutacja zakończyła się powodzeniem
                if result and result.data and result.data.get("refreshToken") and result.data["refreshToken"]["success"]:
                    print("Tokeny zostały odświeżone.")
                    # Jeśli sukces, ustaw nowe tokeny w obiekcie `request` i oznaczenie, że zostały odświeżone
                    request.jwt_token = result.data["refreshToken"]["token"]
                    request.refresh_token = result.data["refreshToken"]["refreshToken"]
                    request._jwt_was_refreshed = True
                    request._jwt_token_to_update = True

                else:
                    print("Nie udało się odświeżyć tokenu. Usuwanie ciasteczek.")
                    # W przypadku niepowodzenia odświeżania usuń ciasteczka i zwróć błąd
                    response = JsonResponse({"error": "Failed to refresh token."}, status=403)
                    response.delete_cookie("JWT")
                    response.delete_cookie("JWT-Refresh-token")
                    return response

            except Exception as e:
                print(f"Błąd odświeżania tokenu: {e}")
                response = JsonResponse({"error": "Error refreshing token."}, status=403)
                response.delete_cookie("JWT")
                response.delete_cookie("JWT-Refresh-token")
                return response

        # Jeśli brakuje obu tokenów (JWT i refresh token), zwróć błąd
        elif not jwt_token and not refresh_token:
            return JsonResponse({"error": "Authentication credentials were not provided or expired."}, status=403)

    def process_response(self, request, response):
        # Jeśli tokeny zostały odświeżone, ustaw je w ciasteczkach
        if getattr(request, '_jwt_token_to_update', False):
            print("Ustawianie nowych tokenów w ciasteczkach.")
            response.set_cookie('JWT', request.jwt_token, httponly=True, secure=True, samesite='Lax')
            response.set_cookie('JWT-Refresh-token', request.refresh_token, httponly=True, secure=True, samesite='Lax')

        # Usuwanie ciasteczek po wylogowaniu
        if hasattr(request, 'delete_jwt_cookies') and request.delete_jwt_cookies:
            print("Usuwanie ciasteczek po wylogowaniu.")
            response.delete_cookie('JWT')
            response.delete_cookie('JWT-Refresh-token')

        return response
