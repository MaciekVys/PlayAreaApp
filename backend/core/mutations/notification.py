import graphene
from graphql_jwt.decorators import login_required
from core.models import Match, Notification, Team

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

            return DeleteNotification(success=True, message="Notification deleted successfully.")

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
            # Pobranie drużyny na podstawie ID
            team = Team.objects.get(id=team_id)

            # Sprawdzenie, czy użytkownik już należy do drużyny
            if team.players.filter(id=user.id).exists():
                return SendJoinRequest(success=False, message="You are already a member of this team.")

            # Utworzenie powiadomienia dla kapitana drużyny
            notification_message = f"{user.username} has requested to join your team: {team.name}."
            Notification.objects.create(
                sender=user, 
                recipient=team.captain, 
                notification_type='join_request',  
                message=notification_message
            )

            return SendJoinRequest(success=True, message="Join request sent successfully.")

        except Team.DoesNotExist:
            return SendJoinRequest(success=False, message="Team not found.")

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
                return RespondToJoinRequest(success=False, message="You are not the captain of this team.")

            if notification.notification_type != 'join_request':
                return RespondToJoinRequest(success=False, message="This notification is not a join request.")

            # Oznaczamy powiadomienie jako przeczytane
            notification.is_read = True

            # Identyfikacja drużyny na podstawie kapitana
            team = Team.objects.get(captain=notification.recipient)

            if accept:
                # Przypisujemy użytkownika do drużyny przez ustawienie jego pola `team`
                notification.sender.team = team
                notification.sender.save()

                message = "Join request accepted. User added to the team."

                # Tworzymy nowe powiadomienie dla użytkownika
                Notification.objects.create(
                    sender=user,
                    recipient=notification.sender,
                    notification_type='join_request',
                    message=f"You have been accepted into the team: {team.name}."
                )
            else:
                message = "Join request declined."

                # Tworzymy powiadomienie o odrzuceniu dla użytkownika
                Notification.objects.create(
                    sender=user,
                    recipient=notification.sender,
                    notification_type='join_request',
                    message=f"Your request to join the team {team.name} has been declined."
                )

            # Aktualizacja pola is_responded na True w powiadomieniu
            notification.is_responded = True
            notification.save()

            return RespondToJoinRequest(success=True, message=message)

        except Notification.DoesNotExist:
            return RespondToJoinRequest(success=False, message="Notification not found.")
        except Team.DoesNotExist:
            return RespondToJoinRequest(success=False, message="Team not found.")

