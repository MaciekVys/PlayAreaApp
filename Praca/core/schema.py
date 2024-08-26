import graphene
from graphql_auth.schema import UserQuery, MeQuery
from graphql_auth import mutations
from .types import CityType, TeamType, PlayerType
from .models import City, Team, Player
from .mutations.team import CreateTeam

class AuthMutation(graphene.ObjectType):
    register = mutations.Register.Field()
    verify_account = mutations.VerifyAccount.Field()
    token_auth = mutations.ObtainJSONWebToken.Field()


class Query(UserQuery, MeQuery, graphene.ObjectType):
    all_cities = graphene.List(CityType)
    city_name = graphene.Field(CityType, name=graphene.String(required=True))
    all_teams = graphene.List(TeamType)
    all_players = graphene.List(PlayerType)

    def resolve_all_cities(root, info):
        return City.objects.all()
    
    def resolve_city_name(root, info, name):
        try:
            return City.objects.get(name=name)
        except City.DoesNotExist:
            return None
        
    def resolve_all_teams(root, info):
        return Team.objects.all()
    
    def resolve_all_players(self, info):
        return Player.objects.all()


class Mutation(AuthMutation, graphene.ObjectType):
    create_team = CreateTeam.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)