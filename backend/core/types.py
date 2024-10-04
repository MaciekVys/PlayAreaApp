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

    team = graphene.String()

    def resolve_team(self, info):
        return self.name.name

class TeamType(DjangoObjectType):
    class Meta:
        model = Team
        fields = "__all__"

    players = graphene.Int()
    matches = graphene.Int()

    def resolve_players(self, info):
        return self.players.count()
    
    def resolve_matches(self, info):
        return self.matches.count()
    

class MatchType(DjangoObjectType):
    class Meta:
        model = Match
        fields = "__all__"

    winner = graphene.String()

    def resolve_winner(self, info):
        if self.score_home > self.score_away:
            return self.home_team.name
        elif self.score_home < self.score_away:
            return self.away_team
        else:
            return "draw"