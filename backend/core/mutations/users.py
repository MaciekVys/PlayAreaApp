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

# class AuthMutation(graphene.ObjectType):
#     refresh_token = mutations.RefreshToken.Field()



from django.http import JsonResponse
from graphql_jwt.shortcuts import get_token, create_refresh_token

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
            request = info.context
            try:
                # If the username is actually an email, convert it to a username
                username = ExtendUser.objects.get(email=username).username
            except:
                pass
            user = authenticate(username=username, password=password)

            if user is not None:
                if user.status.verified:
                    # Generate tokens
                    access_token = get_token(user)
                    refresh_token = create_refresh_token(user)

                    # Create the response
                    response = JsonResponse({
                        "user": {"username": user.username, "id": user.id},
                        "success": True,
                        "errors": None,
                        "user_id": user.id
                    })

                    # Set cookies
                    response.set_cookie(
                        key="JWT",
                        value=access_token,
                        httponly=True,
                        secure=True,  # Ensure Secure for production
                        samesite="None",
                        domain=".onrender.com",  # Set to your domain
                        max_age=300  # 5 minutes
                    )
                    response.set_cookie(
                        key="JWT-Refresh-token",
                        value=refresh_token,
                        httponly=True,
                        secure=True,  # Ensure Secure for production
                        samesite="None",
                        domain=".onrender.com",  # Set to your domain
                        max_age=7 * 24 * 60 * 60  # 7 days
                    )

                    # Return the response
                    return response
                else:
                    return JsonResponse({
                        "user": None,
                        "success": False,
                        "errors": "Please verify your email address",
                        "user_id": None
                    })
            else:
                return JsonResponse({
                    "user": None,
                    "success": False,
                    "errors": "Invalid credentials",
                    "user_id": None
                })
        except Exception as e:
            return JsonResponse({
                "success": False,
                "errors": str(e),
                "user_id": None
            })


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
        position = graphene.String(required=False)
        weight = graphene.Int(required=False)
        height = graphene.Int(required=False)
        number = graphene.Int(required=False)

    user = graphene.Field(ExtendUserType)

    def mutate(self, info, first_name=None, last_name=None, city_name=None,
               position=None, weight=None, height=None, number=None):
        user = info.context.user

        if not user.is_authenticated:
            raise GraphQLError("Nie jesteś zalogowany!")

        # Aktualizacja podstawowych danych użytkownika
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name

        # Aktualizacja miasta, jeśli podane
        if city_name:
            city = City.objects.filter(name=city_name).first()
            if city is None:
                raise GraphQLError("Miasto o podanej nazwie nie istnieje.")
            user.city = city

        # Aktualizacja pozostałych pól
        if position is not None:
            user.position = position
        if weight is not None:
            user.weight = weight
        if height is not None:
            user.height = height
        if number is not None:
            user.number = number

        try:
            user.save()
        except Exception as e:
            raise GraphQLError(f"Nie udało się zapisać zmian: {str(e)}")

        return UpdateUserProfile(user=user)


class DeleteAccount(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()

    @login_required
    def mutate(self, info):
        user = info.context.user
        user.delete() 
        return DeleteAccount(success=True, message="Konto zostało usunięte.")