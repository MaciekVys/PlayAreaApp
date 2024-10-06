import json
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
import graphene
from graphql_jwt.shortcuts import get_refresh_token
from graphql_jwt.exceptions import JSONWebTokenError
from django.contrib.auth import authenticate, logout
from graphql_jwt.shortcuts import create_refresh_token, get_refresh_token, get_token
from core.models import ExtendUser
from core.types import UserType


class RefreshTokenMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        try:   
            content = json.loads(response.content.decode('utf-8'))

            if 'refreshToken' in content.get('data', {}).get('tokenAuth',{}):
                refresh_token = content['data']['tokenAuth']['refreshToken']
                response.set_cookie(
                    'JWT-Refresh-token',
                    refresh_token,
                    httponly=True,
                    secure=True,
                    samesite='Strict'
                )

        except (json.JSONDecodeError, AttributeError):
            pass

        # Add this block to delete cookies if the flag is set
        if getattr(request, 'delete_jwt_cookies', False):
            response.delete_cookie('JWT-Refresh-token')
            response.delete_cookie('JWT')

        return response

class LoginMutation(graphene.Mutation):
    # Define mutation fields
    class Arguments:
        username = graphene.String()
        email = graphene.String()
        password = graphene.String(required=True)

    user = graphene.Field(UserType)
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

