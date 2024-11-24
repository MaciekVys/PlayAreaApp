import graphene
from .models import City, MatchResult, Notification, PlayerStatistics, PlayerTeamStatistics, Ranking, Team, ExtendUser, League, Match
from graphene_django import DjangoObjectType
from graphene import Node
from django.db.models import Q


class CustomNode(Node):
    @classmethod
    def get_node(cls, info, id):
        return cls._meta.model.objects.get(pk=id)


class PlayerTeamStatisticsType(DjangoObjectType):
    class Meta:
        model = PlayerTeamStatistics
        fields = "__all__"


class ExtendUserType(DjangoObjectType):
    username = graphene.String()
    position = graphene.String()
    id = graphene.ID(required=True)
    team_statistics = graphene.List(PlayerTeamStatisticsType)


    class Meta:
        model = ExtendUser
        interfaces = (CustomNode,) 

        fields = "__all__"

    def resolve_id(self, info):
        return self.pk 
    
    def resolve_team_statistics(self, info):
        return PlayerTeamStatistics.objects.filter(player=self)


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
    matches = graphene.List(lambda: MatchType)
    id = graphene.ID(required=True)
    players = graphene.List(ExtendUserType)
    wins = graphene.Int()
    matches_played = graphene.Int()

    def resolve_wins(self, info):
        # Pobieramy wszystkie mecze, w których drużyna uczestniczyła jako gospodarz lub gość i mecz został zakończony
        matches = Match.objects.filter(
            Q(home_team=self, status='completed') |
            Q(away_team=self, status='completed')
        )
        # Inicjalizujemy licznik wygranych
        wins = 0
        # Iterujemy przez mecze i sprawdzamy zwycięzcę
        for match in matches:
            if match.score_home > match.score_away and match.home_team == self:
                wins += 1
            elif match.score_away > match.score_home and match.away_team == self:
                wins += 1
        return wins

    def resolve_matches_played(self, info):
        # Liczymy wszystkie mecze zakończone, w których drużyna brała udział
        matches_played = Match.objects.filter(
            Q(home_team=self, status='completed') |
            Q(away_team=self, status='completed')
        ).count()
        return matches_played

    def resolve_players_count(self, info):
        return self.players_in_team.count()

    def resolve_players(self, info):
        return self.players_in_team.all()

    def resolve_matches_count(self, info):
        return self.home_matches.count() + self.away_matches.count()  # Liczba meczów

    def resolve_city(self, info):
        return self.city

    def resolve_league(self, info):
        return self.league

    def resolve_captain(self, info):
        return self.captain

    def resolve_matches(self, info):
        home_matches = self.home_matches.all()
        away_matches = self.away_matches.all()
        all_matches = home_matches | away_matches
        return all_matches.order_by('match_date')

    def resolve_id(self, info):
        return self.pk


class RankingType(DjangoObjectType):
    class Meta:
        model = Ranking
        fields = "__all__"



class NotificationType(DjangoObjectType):
    class Meta:
        model = Notification

    is_responded = graphene.Boolean()
    statusMessage = graphene.String()

    def resolve_statusMessage(self, info):
        if self.notification_type == 'join_request':
            if self.status == 'accepted':
                return "Zaakceptowano prośbę przyjęcia do drużyny!"
            elif self.status == 'declined':   
                return "Odrzucono prośbę przyjęcia do drużyny!"
            else:
                None

        if self.notification_type == 'team_invite':
            if self.status == 'accepted':
                return "Zaakceptowano zaproszenie!"
            elif self.status == 'declined':   
                return "Odrzucono zaproszenie!"
            else:
                None        
        
        if self.match:
            if self.match.status == 'scheduled':
                # self.is_responded= True
                return "Mecz zaplanowany."
            elif self.match.status == 'canceled':
                # self.is_responded= True
                return "Mecz został odwołany."
            else:
                return None  
        return None  


    
    
class MatchResultType(DjangoObjectType):
    class Meta:
        model = MatchResult


class PlayerStatisticsType(DjangoObjectType):
    class Meta:
        model = PlayerStatistics
        fields = "__all__"


class MatchType(DjangoObjectType):
    class Meta:
        model = Match
        fields = "__all__"

    winner = graphene.String()
    home_team = graphene.Field(lambda: TeamType)
    away_team = graphene.Field(lambda: TeamType)
    league = graphene.Field(LeagueType)
    home_team_statistics = graphene.List(PlayerStatisticsType)
    away_team_statistics = graphene.List(PlayerStatisticsType)

    def resolve_home_team_statistics(self, info):
        return PlayerStatistics.objects.filter(match_id=self.id, player__team=self.home_team)

    def resolve_away_team_statistics(self, info):
        return PlayerStatistics.objects.filter(match_id=self.id, player__team=self.away_team)
    
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



class PlayerStatisticsSummaryType(graphene.ObjectType):
    user = graphene.Field(ExtendUserType)  # Typ użytkownika, jeśli masz go zdefiniowanego
    id = graphene.ID()
    position = graphene.String()  # Upewnij się, że masz pole `position` w modelu Player
    total_goals = graphene.Int()
    total_assists = graphene.Int()
    total_mvps = graphene.Int()

