from django.db import IntegrityError, transaction
import graphene
from graphql import GraphQLError # type: ignore
from ..types import TeamType
from ..models import City, League, Ranking, Team
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


        user.team = team  # przypisanie drużyny do użytkownika
        user.save() 
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

        return CreateTeam(success=True, team=team, errors=None)



class UpdateTeam(graphene.Mutation):
    class Arguments:
        team_id = graphene.ID(required=True)
        name = graphene.String()
        remove_player_id = graphene.ID()
        new_captain_id = graphene.ID()

    success = graphene.Boolean()
    errors = graphene.String()
    team = graphene.Field(TeamType)

    @login_required
    def mutate(self, info, team_id, name=None, remove_player_id=None, new_captain_id=None):
        user = info.context.user

        # Pobranie drużyny
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return UpdateTeam(success=False, errors="Team Not Found")
        
        # Sprawdzenie, czy użytkownik ma uprawnienia do aktualizacji drużyny
        if not user.is_superuser and team.captain != user:
            return UpdateTeam(success=False, errors="You do not have permission to update this team.")

        # Zmiana nazwy drużyny z weryfikacją unikalności w lidze
        if name:
            if Team.objects.filter(name=name, league=team.league).exclude(id=team.id).exists():
                return UpdateTeam(success=False, errors="A team with this name already exists in the league.")
            team.name = name

        # Usunięcie zawodnika z drużyny
        if remove_player_id:
            try:
                player_to_remove = team.players_in_team.get(id=remove_player_id)
                team.players_in_team.remove(player_to_remove)
            except team.players_in_team.model.DoesNotExist:
                return UpdateTeam(success=False, errors="Player not found in this team.")

        # Przekazanie dowodzenia innemu graczowi
        if new_captain_id:
            try:
                new_captain = team.players_in_team.get(id=new_captain_id)

                if new_captain.team != team:
                    return UpdateTeam(success=False, errors="The selected player is not a member of this team.")
                
                if team.captain == new_captain:
                    return UpdateTeam(success=False, errors="This player is already the captain.")
            
                team.captain = new_captain
                team.save()

            except team.players_in_team.model.DoesNotExist:
                return UpdateTeam(success=False, errors="The specified player is not a member of this team.")
        
        team.save()
        return UpdateTeam(success=True, team=team, errors=None)





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

class LeaveTeam(graphene.Mutation):
    class Arguments:
        team_id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, team_id):
        user = info.context.user

        # Sprawdź, czy użytkownik jest zalogowany
        if not user.is_authenticated:
            return LeaveTeam(success=False, message="Musisz być zalogowany, aby opuścić drużynę.")

        # Sprawdź, czy drużyna istnieje
        try:
            team = Team.objects.get(pk=team_id)
        except Team.DoesNotExist:
            return LeaveTeam(success=False, message="Drużyna nie istnieje.")

        # Sprawdź, czy użytkownik jest członkiem drużyny
        if not team.players_in_team.filter(pk=user.pk).exists():
            return LeaveTeam(success=False, message="Użytkownik nie jest członkiem tej drużyny.")
        
        # Sprawdź, czy użytkownik jest kapitanem
        if user == team.captain:
            # Wybierz nowego kapitana, jeśli jest to możliwe
            new_captain = team.players_in_team.exclude(pk=user.pk).first()  # Wybierz pierwszego gracza, który nie jest kapitanem
            if new_captain:
                team.captain = new_captain
                team.save()

        # Usuń użytkownika z drużyny
        team.players_in_team.remove(user)

        return LeaveTeam(success=True, message="Użytkownik został usunięty z drużyny.")

class DeleteTeam(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        team_id = graphene.ID(required=True)

    def mutate(self, info, team_id):
        # Wyszukaj drużynę na podstawie team_id
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            raise GraphQLError("Drużyna o podanym ID nie istnieje.")

        # Usuń drużynę
        team.delete()
        return DeleteTeam(success=True, message="Drużyna została usunięta.")