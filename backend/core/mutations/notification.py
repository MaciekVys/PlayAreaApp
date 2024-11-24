import graphene
from graphql_jwt.decorators import login_required
from core.types import TeamType
from core.models import ExtendUser, Match, Notification, Team
from datetime import timedelta
from django.utils import timezone



class RespondToMatchInvite(graphene.Mutation):
    class Arguments:
        match_id = graphene.ID(required=True)
        accept = graphene.Boolean(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, match_id, accept):
        user = info.context.user
        try:
            match = Match.objects.get(id=match_id)


            if match.away_team.captain != user:
                return RespondToMatchInvite(success=False, message="You are not the captain of the invited team.")

            if match.is_responded:
                return RespondToMatchInvite(success=False, message="This invitation has already been responded to.")

            # Akceptacja lub odrzucenie meczu
            if accept:
                match.status = 'scheduled'  # Zmieniamy status na zaplanowany
                message = "You have accepted the match invitation."
            else:
                match.status = 'canceled'  # Zmieniamy status na anulowany
                message = "You have declined the match invitation."

            # Oznaczamy, że zaproszenie zostało rozpatrzone
            match.is_responded = True
            
            match.save()

            notification = Notification.objects.filter(match=match, notification_type='match_invite').first()

            if notification:
                # Ustawiamy 'is_responded' na True w powiadomieniu o meczu
                notification.is_responded = True
                notification.save()

            return RespondToMatchInvite(success=True, message=message)

        except Match.DoesNotExist:
            return RespondToMatchInvite(success=False, message="Match not found.")


class DeleteNotification(graphene.Mutation):
    class Arguments:
        notification_id = graphene.Int(required=True)  # Argument do identyfikacji powiadomienia

    success = graphene.Boolean()  # Informacja o sukcesie operacji
    message = graphene.String()   # Wiadomość zwrotna

    def mutate(self, info, notification_id):
        user = info.context.user  # Można sprawdzić, czy użytkownik jest zalogowany i ma dostęp
        try:
            # Znajdź powiadomienie
            notification = Notification.objects.get(id=notification_id)

            # Sprawdź, czy użytkownik jest właścicielem powiadomienia
            if notification.recipient != user:
                return DeleteNotification(success=False, message="You do not have permission to delete this notification.")

            # Usuwanie powiadomienia
            notification.delete()

            return DeleteNotification(success=True, message="Pomyślnie usunięte")

        except Notification.DoesNotExist:
            return DeleteNotification(success=False, message="Notification not found.")


class SendJoinRequest(graphene.Mutation):
    class Arguments:
        team_id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    @login_required
    def mutate(self, info, team_id):
        user = info.context.user
        try:
            # Retrieve the team by ID
            team = Team.objects.get(id=team_id)

            # Check if the user is already a player in the team
            if team.players_in_team.filter(id=user.id).exists():
                return SendJoinRequest(success=False, message="Należysz już do drużyny!")

            # Calculate the time one week ago
            one_week_ago = timezone.now() - timedelta(weeks=1)

            # Check if a join request was already sent in the last week
            existing_notification = Notification.objects.filter(
                sender=user,
                recipient=team.captain,
                notification_type='join_request',
                created_at__gte=one_week_ago
            ).exists()

            if existing_notification:
                return SendJoinRequest(
                    success=False,
                    message="Prośba o dołączenie została już wysłana w ciągu ostatniego tygodnia."
                )

            # Create a notification for the team captain
            notification_message = f"{user.username} wysłał prośbę o dołączenie do drużyny {team.name}."

            Notification.objects.create(
                sender=user,
                recipient=team.captain,
                notification_type='join_request',
                message=notification_message,
            )

            return SendJoinRequest(success=True, message="Prośba o dołączenie została pomyślnie wysłana")

        except Team.DoesNotExist:
            return SendJoinRequest(success=False, message="Nie znaleziono drużyny")

        

class RespondToJoinRequest(graphene.Mutation):
    class Arguments:
        notification_id = graphene.ID(required=True)
        accept = graphene.Boolean(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    @login_required
    def mutate(self, info, notification_id, accept):
        user = info.context.user
        try:
            notification = Notification.objects.get(id=notification_id)

            # Sprawdzenie, czy użytkownik jest kapitanem drużyny
            if notification.recipient != user:
                return RespondToJoinRequest(success=False, message="Nie jesteś kapitanem drużyny!")

            if notification.notification_type != 'join_request':
                return RespondToJoinRequest(success=False, message="This notification is not a join request.")

            # Oznaczamy powiadomienie jako przeczytane
            notification.is_read = True

            # Identyfikacja drużyny na podstawie kapitana
            team = Team.objects.get(captain=notification.recipient)

            if accept:
                # Jeżeli gracz jest już w jakiejś drużynie, opuszcza ją przed dołączeniem do nowej
                if notification.sender.team:
                    notification.sender.leave_team()

                notification.sender.team = team
                notification.sender.save()

                message = "Prośba o dołączenie zaakceptowana, użytkownik dodany do drużyny!"
                notification.status = 'accepted'  # Zmienione na wartość tekstową

                # Tworzymy nowe powiadomienie dla użytkownika
                # Notification.objects.create(
                #     sender=user,
                #     recipient=notification.sender,
                #     notification_type='join_request',
                #     message=f"Zaakceptowano prośbę o dołączenie do drużyny {team.name}."
                # )
            else:
                message = "Join request declined."
                notification.status = 'declined'  # Zmienione na wartość tekstową

                # Tworzymy powiadomienie o odrzuceniu dla użytkownika
                # Notification.objects.create(
                #     sender=user,
                #     recipient=notification.sender,
                #     notification_type='join_request',
                #     message=f"Twoja prośba o dołączenie do drużyny {team.name} została odrzucona"
                # )

            notification.is_responded = True
            notification.save()

            return RespondToJoinRequest(success=True, message=message)

        except Notification.DoesNotExist:
            return RespondToJoinRequest(success=False, message="Notification not found.")
        except Team.DoesNotExist:
            return RespondToJoinRequest(success=False, message="Team not found.")



class InvitePlayerToTeam(graphene.Mutation):
    class Arguments:
        team_id = graphene.ID(required=True)
        player_id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    team = graphene.Field(TeamType)

    @login_required
    def mutate(self, info, team_id, player_id):
        user = info.context.user

        # Pobranie drużyny
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return InvitePlayerToTeam(success=False, message="Team not found")


        # Sprawdzenie, czy użytkownik ma uprawnienia do zapraszania graczy
        if not user.is_superuser and team.captain != user:
            return InvitePlayerToTeam(success=False, message="You do not have permission to invite players to this team.")

        # Pobranie zapraszanego gracza
        try:
            player = ExtendUser.objects.get(id=player_id)
        except ExtendUser.DoesNotExist:
            return InvitePlayerToTeam(success=False, message="Player not found")

        # Sprawdzenie, czy zaproszenie zostało wysłane w ciągu ostatniego tygodnia
        one_week_ago = timezone.now() - timedelta(weeks=1)
        recent_invitation = Notification.objects.filter(
            sender=user,
            recipient=player,
            notification_type='team_invite',
            created_at__gte=one_week_ago
        ).exists()

        if recent_invitation:
            return InvitePlayerToTeam(success=False, message="An invitation has already been sent to this player in the last week.")

        # Tworzenie powiadomienia o zaproszeniu do drużyny
        notification_message = f"You have been invited to join the team {team.name}."
        Notification.objects.create(
            sender=user,
            recipient=player,
            notification_type='team_invite',
            message=notification_message,
        )

        return InvitePlayerToTeam(success=True, team=team, message="Invitation sent successfully.")



class RespondToTeamInvite(graphene.Mutation):
    class Arguments:
        notification_id = graphene.ID(required=True)
        accept = graphene.Boolean(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    @login_required
    def mutate(self, info, notification_id, accept):
        user = info.context.user

        try:
            # Retrieve the invitation notification
            notification = Notification.objects.get(
                id=notification_id,
                recipient=user,
                notification_type='team_invite'
            )

            if notification.is_responded:
                return RespondToTeamInvite(
                    success=False,
                    message="You have already responded to this invitation."
                )

            # Retrieve the team associated with the invitation
            team = Team.objects.get(id=notification.sender.team.id)

            if accept:
                # Check if the user is a captain of any team
                if Team.objects.filter(captain=user).exists():
                    return RespondToTeamInvite(
                        success=False,
                        message="You are already a captain of another team and cannot join as a player."
                    )

                # If the player is already in a team, leave it before joining the new one
                if user.team:
                    user.leave_team()

                # Add the player to the team
                team.players_in_team.add(user)
                user.team = team
                user.save()
                message = f"You have joined the team {team.name}."
                notification.status = 'accepted'
            else:
                message = "You have declined the team invitation."
                notification.status = 'declined'

            # Mark the notification as responded
            notification.is_responded = True
            notification.save()

            return RespondToTeamInvite(success=True, message=message)

        except Notification.DoesNotExist:
            return RespondToTeamInvite(
                success=False,
                message="Invitation not found."
            )

# import graphene
# from graphql_jwt.decorators import login_required
# from core.models import ExtendUser, Match, Notification, Team
# from core.types import TeamType
# from django.db.models import Q
# from datetime import timedelta
# from django.utils import timezone

# # Existing mutations...

import graphene
from graphql_jwt.decorators import login_required
from core.types import TeamType
from core.models import ExtendUser, Match, Notification, Team
from django.db.models import Q
from datetime import timedelta
from django.utils import timezone

class ChallengeTeamToMatch(graphene.Mutation):
    class Arguments:
        away_team_id = graphene.ID(required=True)
        match_date = graphene.Date(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    @login_required
    def mutate(self, info, away_team_id, match_date):
        user = info.context.user

        try:
            # Pobranie drużyny użytkownika (zakładając, że jest kapitanem)
            home_team = Team.objects.get(captain=user)

            # Pobranie drużyny przeciwnika
            away_team = Team.objects.get(id=away_team_id)

            if home_team.id == away_team.id:
                return ChallengeTeamToMatch(
                    success=False,
                    message="Nie możesz wyzwać własnej drużyny."
                )

            if home_team.league != away_team.league:
                return ChallengeTeamToMatch(
                    success=False,
                    message="Obie drużyny muszą być w tej samej lidze."
                )

            one_week_ago = timezone.now() - timedelta(weeks=1)

            # Sprawdzenie, czy wyzwanie zostało już wysłane w ciągu ostatniego tygodnia
            existing_notification = Notification.objects.filter(
                sender=home_team.captain,
                recipient=away_team.captain,
                notification_type='match_invite',
                created_at__gte=one_week_ago
            ).exists()

            if existing_notification:
                return ChallengeTeamToMatch(
                    success=False,
                    message="Wyzwano już tę drużynę w ciągu ostatniego tygodnia."
                )

            # Tworzenie meczu
            city = home_team.league.city

            match = Match.objects.create(
                home_team=home_team,
                away_team=away_team,
                match_date=match_date,
                city=city,
                status='pending'
            )

            # Definicja funkcji wewnątrz mutacji
            def send_match_invite(match):
                sender = info.context.user  # Pobranie aktualnego użytkownika
                notification_message = f"{sender.username} wyzwał Twoją drużynę na mecz w dniu {match.match_date}."
                Notification.objects.create(
                    sender=sender,
                    recipient=match.away_team.captain,
                    notification_type='match_invite',
                    message=notification_message,
                    match=match  # Jeśli Twój model Notification ma to pole
                )

            # Wysłanie powiadomienia
            send_match_invite(match)

            return ChallengeTeamToMatch(
                success=True,
                message="Wyzwanie zostało pomyślnie wysłane."
            )

        except Team.DoesNotExist:
            return ChallengeTeamToMatch(
                success=False,
                message="Jedna z drużyn nie istnieje."
            )
        except Exception as e:
            return ChallengeTeamToMatch(
                success=False,
                message=str(e)
            )
