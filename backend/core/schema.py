import graphene
from graphql_auth.schema import UserQuery, MeQuery
from graphql_auth import mutations
from graphql_jwt.decorators import login_required

from .types import CityType, TeamType, PlayerType, UserType, MatchType
from .models import City, Team, Player, Match
from .mutations.team import CreateTeam
from .mutations.users import Logout, LoginMutation

class AuthMutation(graphene.ObjectType):
    register = mutations.Register.Field()
    verify_account = mutations.VerifyAccount.Field()
    # token_auth = mutations.ObtainJSONWebToken.Field()
    refresh_token = mutations.RefreshToken.Field()
    revoke_token = mutations.RevokeToken.Field()

    


class Query(UserQuery, MeQuery, graphene.ObjectType):
    all_cities = graphene.List(CityType)
    city_name = graphene.Field(CityType, name=graphene.String(required=True))
    all_teams = graphene.List(TeamType)
    all_players = graphene.List(PlayerType)
    team_by_user_id = graphene.Field(TeamType, user_id=graphene.Int(required=True))
    playerProfile = graphene.Field(PlayerType, user_id=graphene.Int(required=True))
    user_city = graphene.Field(CityType)
    matches = graphene.List(MatchType)

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
    
    @login_required
    def resolve_team_by_user_id(self, info, user_id):
        try:
            player = Player.objects.get(user__id=user_id)
            if player.team:
                return player.team
            return None
        except Player.DoesNotExist:
            return None
    
    @login_required
    def resolve_playerProfile(self, info, user_id):
        try:
            player = Player.objects.get(user__id=user_id)
            if player:
                return player
            return None
        except Player.DoesNotExist:
            return None
    
    @login_required
    def resolve_user_city(self, info):
        user = info.context.user
        try:
            return user.city
        except AttributeError:
            return None
    
    def resolve_matches(self, info):
        return Match.objects.all()



class Mutation(AuthMutation, graphene.ObjectType):
    create_team = CreateTeam.Field()
    login = LoginMutation.Field()
    logout = Logout.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)