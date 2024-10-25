from django.db import IntegrityError
import graphene # type: ignore
from ..types import TeamType
from ..models import City, League, Ranking, Team, Player
from graphql_jwt.decorators import login_required # type: ignore
from core.models import Match, Team
from core.services import send_match_invite

class CreateTeam(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        city_name = graphene.String(required=True)

    success = graphene.Boolean()
    errors = graphene.String()
    team = graphene.Field(TeamType)

    @login_required
    def mutate(self, info, name, city_name):
        user = info.context.user

         # Sprawdzamy, czy użytkownik nie jest już kapitanem innej drużyny
        if Team.objects.filter(captain=user).exists():
            return CreateTeam(success=False, errors="This user is already a captain of another team.", team=None)
        
        try:
            city = City.objects.get(name=city_name)
        except City.DoesNotExist:
            return CreateTeam(success=False, errors="City not found", team=None)

        # Ensure the league with the city exists or create it if needed
        league, created = League.objects.get_or_create(city=city)

       # Próba stworzenia drużyny
        try:
            team = Team(name=name, league=league, captain=user)
            team.save()
        except IntegrityError:
            return CreateTeam(success=False, errors="A team with this name already exists in the league.", team=None)

        # Tworzymy ranking drużyny
        ranking = Ranking(
            league=league,
            team=team,
            points=0,  # Początkowe punkty
            match_played=0,  # Początkowa liczba rozegranych meczów
            wins=0,  # Początkowa liczba wygranych
            draws=0,  # Początkowa liczba remisów
            losses=0,  # Początkowa liczba przegranych
            goals_for=0,  # Początkowa liczba strzelonych goli
            goals_against=0  # Początkowa liczba straconych goli
        )
        ranking.save()  # Zapisujemy rekord w tabeli rankingowej

        # Create the player and associate it with the team
        player = Player(user=user, team=team)
        player.save()

        return CreateTeam(success=True, team=team, errors=None)



class UpdateTeam(graphene.Mutation):
    class Arguments:
        team_id = graphene.ID(required=True)
        name = graphene.String(required=True)
        add_player_id = graphene.ID(required=True)
        remove_player_id = graphene.ID(required=True)

    success = graphene.Boolean()
    errors = graphene.String()
    team = graphene.Field(TeamType)

    @login_required
    def mutate(self, info, team_id, name=None, add_player_id=None, remove_player_id=None):
        user = info.context.user

        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return UpdateTeam(success=False, errors='Team Not Found')
        
        if not user.id_superuser and team.captain != user:
            return UpdateTeam(success=False, errors="You do not have permission to update team!")
        
        if name:
            team.name = name

class ChallengeTeamToMatch(graphene.Mutation):
    class Arguments:
        away_team_id = graphene.ID(required=True)
        match_date = graphene.Date(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, away_team_id, match_date):
        user = info.context.user

        # Upewniamy się, że użytkownik jest zalogowany
        if not user.is_authenticated:
            return ChallengeTeamToMatch(success=False, message="You must be logged in to challenge a team.")

        try:
            # Pobieramy drużynę użytkownika (zakładając, że użytkownik jest kapitanem)
            home_team = Team.objects.get(captain=user)

            # Pobieramy drużynę przeciwnika
            away_team = Team.objects.get(id=away_team_id)

            # Sprawdzamy, czy użytkownik nie próbuje wyzwać swojej własnej drużyny
            if home_team.id == away_team.id:
                return ChallengeTeamToMatch(success=False, message="You cannot challenge your own team.")

            # Sprawdzamy, czy obie drużyny są w tej samej lidze
            if home_team.league != away_team.league:
                return ChallengeTeamToMatch(success=False, message="Both teams must be in the same league.")

            city = home_team.league.city

            # Tworzymy mecz
            match = Match.objects.create(
                home_team=home_team,
                away_team=away_team,
                match_date=match_date,
                city=city,
                status='pending'  # Możesz zmienić status w zależności od logiki
            )

            # Wysyłamy powiadomienie do kapitana drużyny przeciwnika
            send_match_invite(match)

            return ChallengeTeamToMatch(success=True, message="Challenge sent successfully.")

        except Team.DoesNotExist:
            return ChallengeTeamToMatch(success=False, message="One of the teams does not exist.")
        except Exception as e:
            return ChallengeTeamToMatch(success=False, message=str(e))



# class AddTeamToLeagueMutation(graphene.Mutation):
#     class Arguments:
#         team_id = graphene.Int()
#         league_id = graphene.Int()

#     status = graphene.String()

#     def mutate(self, info, team_id, league_id):
#         team = Team.objects.get(id=team_id)
#         league = League.objects.get(id=league_id)
        
#         result = add_team_to_league(team, league)
        
#         return AddTeamToLeagueMutation(status=result)
    
# class JoinTeamMutation(graphene.Mutation):
#     class Arguments:
#         team_id = graphene.Int()

#     status = graphene.String()

#     def mutate(self, info, team_id):
#         user = info.context.user
#         team = Team.objects.get(id=team_id)
        
#         result = join_team(user, team)
        
#         return JoinTeamMutation(status=result)