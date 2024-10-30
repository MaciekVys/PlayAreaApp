import graphene
from graphene_django.types import DjangoObjectType
from ..models import Match, PlayerStatistics,MatchResult, Team

class PlayerStatisticsInput(graphene.InputObjectType):
    player_id = graphene.Int(required=True)
    goals = graphene.Int(required=True)
    assists = graphene.Int(required=True)
    is_mvp = graphene.Boolean(required=False)
    team_score = graphene.Int(required=True)  # New field for team score

class ConfirmMatchResult(graphene.Mutation):
    class Arguments:
        match_id = graphene.Int(required=True)
        is_home_team = graphene.Boolean(required=True)
        statistics = graphene.List(PlayerStatisticsInput, required=True)

    success = graphene.Boolean()

    @staticmethod
    def mutate(root, info, match_id, is_home_team, statistics):
        # Pobranie zalogowanego użytkownika
        user = info.context.user

        # Pobranie meczu
        match = Match.objects.get(id=match_id)

        # Sprawdzenie stanu meczu
        if match.status == 'canceled':
            raise Exception("Nie można wprowadzić statystyk do odwołanego meczu.")

        if match.status != 'scheduled':
            raise Exception("Nie można wprowadzić statystyk do meczu, który nie jest zaplanowany.")

        match_result, created = MatchResult.objects.get_or_create(match=match)

        # Ustalanie drużyny na podstawie flagi is_home_team
        team = match.home_team if is_home_team else match.away_team

        # Sprawdzenie, czy użytkownik jest kapitanem tej drużyny
        if is_home_team:
            if match.home_team.captain != user:
                raise Exception("Tylko kapitan drużyny gospodarzy może dodawać statystyki dla swojej drużyny.")
        else:
            if match.away_team.captain != user:
                raise Exception("Tylko kapitan drużyny gości może dodawać statystyki dla swojej drużyny.")

        # Przetwarzanie statystyk dla zawodników
        for stat in statistics:
            player = Player.objects.get(id=stat.player_id)

            # Sprawdzanie, czy zawodnik należy do drużyny potwierdzającej
            if player.team != team:
                raise Exception(f"Zawodnik nie należy do drużyny {'gospodarzy' if is_home_team else 'gości'}.")

            # Aktualizacja statystyk zawodnika
            PlayerStatistics.objects.update_or_create(
                match=match,
                player=player,
                defaults={
                    'goals': stat.goals,
                    'assists': stat.assists,
                    'is_mvp': stat.is_mvp or False,
                }
            )

        # Zapisanie wyniku dla drużyny
        if is_home_team:
            match.score_home = statistics[0].team_score  # Assuming one score input for team
        else:
            match.score_away = statistics[0].team_score  # Assuming one score input for team

        match.save()

        # Aktualizacja statusu potwierdzenia dla wyniku meczu
        if is_home_team:
            match_result.home_team_confirmed = True
        else:
            match_result.away_team_confirmed = True

        match_result.save()

        # Sprawdzanie, czy obie drużyny potwierdziły wynik
        if match_result.home_team_confirmed and match_result.away_team_confirmed:
            match.status = 'completed'
            match.save()

        return ConfirmMatchResult(success=True)
