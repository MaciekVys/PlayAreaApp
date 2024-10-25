import graphene
from graphene_django.types import DjangoObjectType
from core.models import Match, Notification

class RespondToMatchInvite(graphene.Mutation):
    class Arguments:
        match_id = graphene.ID(required=True)
        accept = graphene.Boolean(required=True)

    success = graphene.Boolean()
    message = graphene.String()
    statusMessage = graphene.String()  # Zwracamy statusMessage jako dodatkową informację

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
                status_message = "Mecz zaakceptowany"
            else:
                match.status = 'canceled'  # Zmieniamy status na anulowany
                message = "You have declined the match invitation."
                status_message = "Mecz został odwołany."

            # Oznaczamy, że zaproszenie zostało rozpatrzone
            match.is_responded = True
            match.save()

            return RespondToMatchInvite(success=True, message=message, statusMessage=status_message)

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

