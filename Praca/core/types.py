import graphene
from .models import City, Team, Player, ExtendUser
from graphene_django import DjangoObjectType


class UserType(DjangoObjectType):
    class Meta:
        model = ExtendUser
        fields = ("id", "username", "email", "first_name", "last_name")


class CityType(DjangoObjectType):
    class Meta:
        model = City
        fields = "__all__"


class PlayerType(DjangoObjectType):
    user = graphene.List(UserType)

    class Meta:
        model = Player
        fields = ("id", "username", "team" , "goals", "assists", "mvp")

class TeamType(DjangoObjectType):
    players = graphene.List(PlayerType)

    class Meta:
        model = Team
        fields = ("id", "name", "city", "players")