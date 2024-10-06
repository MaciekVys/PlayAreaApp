import graphene
from .models import City, Team, Player, ExtendUser, League, Match
from graphene_django import DjangoObjectType


class UserType(DjangoObjectType):
    class Meta:
        model = ExtendUser
        fields = "__all__"


class CityType(DjangoObjectType):
    class Meta:
        model = City
        fields = "__all__"

    teams_count = graphene.Int()

    def resolve_teams_count(self, info):
        return self.teams_in_city.count()


class LeagueType(DjangoObjectType):
    class Meta:
        model = League

    teams_count = graphene.Int()
    matches_count = graphene.Int()

    def resolve_teams_count(self, info):
        return self.teams_in_league.count()
    
    def resolve_matches_count(self, info):
        return self.matches.count()
    

class PlayerType(DjangoObjectType):
    class Meta:
        model = Player
        fields = "__all__"

    user = graphene.Field(UserType)

    def resolve_uder(self, info):
        return self.user


        
class TeamType(DjangoObjectType):
    class Meta:
        model = Team
        fields = "__all__"

    name = graphene.String()
    players_count = graphene.Int()
    matches_count = graphene.Int()
    city = graphene.Field(CityType)
    league = graphene.Field(LeagueType)
    captain = graphene.Field(UserType)
    players = graphene.List(PlayerType)
    matches = graphene.List(lambda: MatchType)  # Użycie lambda

    def resolve_players_count(self, info):
        return self.players.count()

    def resolve_matches_count(self, info):
        return self.home_matches.count() + self.away_matches.count()

    def resolve_city(self, info):
        return self.city

    def resolve_league(self, info):
        return self.league

    def resolve_captain(self, info):
        return self.captain

    def resolve_players(self, info):
        return self.players.all()

    def resolve_matches(self, info):
        home_matches = self.home_matches.all()
        away_matches = self.away_matches.all()
        all_matches = home_matches | away_matches
        return all_matches.order_by('match_date')


class MatchType(DjangoObjectType):
    class Meta:
        model = Match
        fields = "__all__"

    winner = graphene.String()
    home_team = graphene.Field(lambda: TeamType)  # Użycie lambda
    away_team = graphene.Field(lambda: TeamType)
    league = graphene.Field(LeagueType)

    def resolve_home_team(self, info):
        return self.home_team

    def resolve_away_team(self, info):
        return self.away_team

    def resolve_league(self, info):
        return self.league

    def resolve_winner(self, info):
        if self.score_home > self.score_away:
            return self.home_team.name
        elif self.score_home < self.score_away:
            return self.away_team.name
        else:
            return "draw"