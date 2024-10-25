import graphene
from .models import City, MatchResult, Notification, PlayerStatistics, Ranking, Team, Player, ExtendUser, League, Match
from graphene_django import DjangoObjectType
from graphene import Node

class CustomNode(Node):
    @classmethod
    def get_node(cls, info, id):
        return cls._meta.model.objects.get(pk=id)


class ExtendUserType(DjangoObjectType):

    id = graphene.ID(required=True)

    class Meta:
        model = ExtendUser
        interfaces = (CustomNode,) 

        fields = "__all__"

    def resolve_id(self, info):
        return self.pk 
    

class CityType(DjangoObjectType):
    class Meta:
        model = City
        interfaces = (CustomNode,) 

        fields = "__all__"

    teams_count = graphene.Int()
    id = graphene.ID(required=True)

    def resolve_teams_count(self, info):
        return self.teams_in_city.count()
    
    def resolve_id(self, info):
        return self.pk 


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

    user = graphene.Field(ExtendUserType)

    def resolve_uder(self, info):
        return self.user


        
class TeamType(DjangoObjectType):
    class Meta:
        model = Team
        interfaces = (CustomNode,) 
        fields = "__all__"

    name = graphene.String()
    players_count = graphene.Int()
    matches_count = graphene.Int()
    city = graphene.Field(CityType)
    league = graphene.Field(LeagueType)
    captain = graphene.Field(ExtendUserType)
    players = graphene.List(PlayerType)
    matches = graphene.List(lambda: MatchType)
    id = graphene.ID(required=True)


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
    
    def resolve_id(self, info):
        return self.pk 



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


class RankingType(DjangoObjectType):
    class Meta:
        model = Ranking
        fields = (
            'id',
            'league',
            'team',
            'points',
            'match_played',
            'wins',
            'draws',
            'losses',
            'goals_for',
            'goals_against',
        )


class NotificationType(DjangoObjectType):
    class Meta:
        model = Notification

    id = graphene.Int()
    isRead = graphene.Boolean()
    recipient = graphene.Field(ExtendUserType) 
    message = graphene.String()
    createdAt = graphene.DateTime()
    statusMessage = graphene.String()
    isResponded = graphene.Boolean() 

    def resolve_statusMessage(self, info):
        if self.match:
            if self.match.status == 'scheduled':
                return "Mecz zaplanowany."
            elif self.match.status == 'canceled':
                return "Mecz został odwołany."
            else:
                return None  # Inne statusy meczu, jeśli nie są obsługiwane
        return None  # Powiadomienia, które nie dotyczą meczu   

    def resolve_isResponded(self, info):
        if self.match:  # Jeśli powiadomienie dotyczy meczu
            return self.match.is_responded  # Zwracamy, czy odpowiedziano na mecz
        return False  # Powiadomienia, które nie dotyczą meczu
    
    
class MatchResultType(DjangoObjectType):
    class Meta:
        model = MatchResult

class PlayerStatisticsType(DjangoObjectType):
    class Meta:
        model = PlayerStatistics
        fields = "__all__"


class PlayerStatisticsSummaryType(graphene.ObjectType):
    user = graphene.Field(ExtendUserType)  # Typ użytkownika, jeśli masz go zdefiniowanego
    id = graphene.ID()
    position = graphene.String()  # Upewnij się, że masz pole `position` w modelu Player
    total_goals = graphene.Int()
    total_assists = graphene.Int()
    total_mvps = graphene.Int()