import json
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
import graphene
from graphql_jwt.shortcuts import get_refresh_token
from graphql_jwt.exceptions import JSONWebTokenError
from django.contrib.auth import authenticate, logout
from graphql_jwt.shortcuts import create_refresh_token, get_refresh_token, get_token
from core.models import ExtendUser
from core.types import  ExtendUserType
from graphql_auth import mutations
from ..models import City
from graphql import GraphQLError
from graphql_jwt.decorators import login_required

class AuthMutation(graphene.ObjectType):
    refresh_token = mutations.RefreshToken.Field()

class RefreshTokenMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Sprawdzenie, czy token został już odświeżony w ramach tego żądania
        if hasattr(request, '_jwt_was_refreshed'):
            return None

        # Pobranie JWT i refresh tokena z ciasteczek
        jwt_token = request.COOKIES.get("JWT")
        refresh_token = request.COOKIES.get("JWT-Refresh-token")
        
        # Logowanie stanu początkowego
        print(f"JWT Token: {jwt_token}")
        print(f"Refresh Token: {refresh_token}")

        # Jeśli JWT istnieje, sprawdź jego czas wygaśnięcia
        if jwt_token:
            # Jeśli JWT istnieje, ale brak refresh tokena, usuń ciasteczka
            if not refresh_token:
                print("Brak Refresh Tokena, usuwanie ciasteczek.")
                response = JsonResponse({"error": "Authentication credentials were not provided or expired."}, status=403)
                response.delete_cookie("JWT")
                response.delete_cookie("JWT-Refresh-token")
                return response

        # Jeśli JWT nie istnieje, ale jest refresh token, spróbuj odświeżyć token
        if jwt_token is None and refresh_token:
            try:
                # Tworzenie schematu z użyciem AuthMutation do odświeżenia tokena
                schema = graphene.Schema(mutation=AuthMutation)
                # Wykonanie mutacji odświeżenia tokena
                print("Próba odświeżenia tokenu za pomocą refresh tokena...")
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
                    # Jeśli sukces, ustaw nowe tokeny w obiekcie `request` i oznacz, że został odświeżony
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
        return None

    def process_response(self, request, response):
        # Logowanie, żeby sprawdzić, czy mamy nowe tokeny do ustawienia w ciasteczkach
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



class LoginMutation(graphene.Mutation):
    # Define mutation fields
    class Arguments:
        username = graphene.String()
        email = graphene.String()
        password = graphene.String(required=True)

    user = graphene.Field(ExtendUserType)
    success = graphene.Boolean()
    errors = graphene.String()
    user_id = graphene.ID()  # Add this field to return user ID

    @classmethod
    def mutate(cls, root, info, password, username, **kwargs):
        try:
            context = info.context
            try:
                # If the username is actually an email, convert it to a username
                username = ExtendUser.objects.get(email=username).username
            except:
                pass
            user = authenticate(username=username, password=password)

            if user is not None:
                if user.status.verified:
                    context.jwt_cookie = True
                    context.jwt_refresh_token = create_refresh_token(user)
                    context.jwt_token = get_token(user)
                    context.user = user
                    return cls(
                        user=user,
                        success=True,
                        errors=None,
                        user_id=user.id  # Return user ID here
                    )
                else:
                    return cls(
                        user=None,
                        success=False,
                        errors="Please verify your email address",
                        user_id=None
                    )
            else:
                return cls(user=None, success=False, errors="Invalid credentials", user_id=None)
        except Exception as e:
            return cls(success=False, errors=str(e), user_id=None)


class Logout(graphene.Mutation):
    success = graphene.Boolean()
    errors = graphene.String()

    def mutate(self, info, **kwargs):
        request = info.context

        # Pobierz tokeny z ciasteczek
        refresh_token = request.COOKIES.get('JWT-Refresh-token')
        token = request.COOKIES.get('JWT')

        # Sprawdź, czy tokeny istnieją
        if refresh_token is None or token is None:
            return Logout(success=False, errors="Brak tokenu do wylogowania.")

        # Usuń refresh token z bazy danych
        try:
            refresh_token_instance = get_refresh_token(refresh_token)
            if refresh_token_instance is None:
                return Logout(success=False, errors="Nie znaleziono refresh tokenu.")
            refresh_token_instance.delete()
        except JSONWebTokenError as e:
            return Logout(success=False, errors=f"Token jest nieprawidłowy: {str(e)}")
        except Exception as e:
            return Logout(success=False, errors=f"Nie można usunąć refresh tokenu: {str(e)}")

        # Ustaw flagę do usunięcia ciasteczek
        request.delete_jwt_cookies = True

        return Logout(success=True)


class UpdateUserProfile(graphene.Mutation):
    class Arguments:
        first_name = graphene.String(required=False)
        last_name = graphene.String(required=False)
        city_name = graphene.String(required=False)
        position = graphene.String(required=False)  # Jeśli model gracza nie istnieje, to można to pominąć
        weight = graphene.Int(required=False)  # Jeśli model gracza nie istnieje, to można to pominąć
        height = graphene.Int(required=False)  # Jeśli model gracza nie istnieje, to można to pominąć
        number = graphene.Int(required=False)  # Jeśli model gracza nie istnieje, to można to pominąć

    user = graphene.Field(ExtendUserType)  # Zwracamy użytkownika

    def mutate(self, info, first_name=None, last_name=None, city_name=None,
               position=None, weight=None, height=None, number=None):
        user = info.context.user
        
        if not user.is_authenticated:
            raise GraphQLError("Nie jesteś zalogowany!")

        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name

        # Sprawdzanie i aktualizacja miasta
        if city_name:
            city = City.objects.filter(name=city_name).first()  # Sprawdza, czy miasto istnieje
            if city is None:
                raise GraphQLError("Miasto o podanej nazwie nie istnieje.")  # Można rzucić wyjątek, jeśli miasto nie istnieje
            user.city = city  # Przypisanie istniejącego miasta do użytkownika

        user.save()  # Zapisujemy zmiany w profilu użytkownika

        # Jeśli chcesz zaktualizować inne informacje o graczu, ale nie masz modelu `Player`, pomiń te operacje
        # Jeśli model gracza byłby w przyszłości, można by je uwzględnić tutaj.

        return UpdateUserProfile(user=user)  # Zwracamy zaktualizowanego użytkownika
