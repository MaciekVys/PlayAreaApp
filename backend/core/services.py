from core.models import Match, Notification
from core.models import Ranking

def send_match_invite(match):
    # Tworzymy powiadomienie dla kapitana drużyny wyzwanej
    Notification.objects.create(
        recipient=match.away_team.captain,
        notification_type='match_invite',
        match=match,
        message=f"You have been challenged to a match by {match.home_team.name}."
    )

def send_match_confirmation(match):
    # Powiadomienia dla obu kapitanów po zakończeniu meczu
    Notification.objects.create(
        recipient=match.home_team.captain,
        notification_type='match_result',
        match=match,
        message=f"The match {match.home_team.name} vs {match.away_team.name} has been completed. Final score: {match.score_home} - {match.score_away}."
    )

    Notification.objects.create(
        recipient=match.away_team.captain,
        notification_type='match_result',
        match=match,
        message=f"The match {match.home_team.name} vs {match.away_team.name} has been completed. Final score: {match.score_home} - {match.score_away}."
    )



def update_team_stats_after_match(match):
    home_ranking = Ranking.objects.get(team=match.home_team, league=match.league)
    away_ranking = Ranking.objects.get(team=match.away_team, league=match.league)

    home_ranking.match_played += 1
    away_ranking.match_played += 1

    home_ranking.goals_for += match.score_home
    home_ranking.goals_against += match.score_away

    away_ranking.goals_for += match.score_away
    away_ranking.goals_against += match.score_home

    if match.score_home > match.score_away:
        home_ranking.wins += 1
        away_ranking.losses += 1
        home_ranking.points += 3
    elif match.score_home < match.score_away:
        away_ranking.wins += 1
        home_ranking.losses += 1
        away_ranking.points += 3
    else:
        home_ranking.draws += 1
        away_ranking.draws += 1
        home_ranking.points += 1
        away_ranking.points += 1

    home_ranking.save()
    away_ranking.save()
