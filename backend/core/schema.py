import graphene
from graphql import GraphQLError
from graphql_auth.schema import UserQuery, MeQuery
from graphql_auth import mutations
from graphql_jwt.decorators import login_required

from .mutations.uploads import UploadPhotoMutation, UploadTeamLogo
from .types import CityType, ExtendUserType, PlayerStatisticsSummaryType, PlayerStatisticsType, RankingType, TeamType,  MatchType, NotificationType
from .models import City, ExtendUser, MatchResult, PlayerStatistics, Ranking, Team,  Match, Notification
from .mutations.team import ChallengeTeamToMatch, CreateTeam, DeleteTeam, LeaveTeam, UpdateTeam
from .mutations.users import DeleteAccount, Logout, LoginMutation, UpdateUserProfile
from .mutations.notification import DeleteNotification, InvitePlayerToTeam, RespondToJoinRequest, RespondToMatchInvite, RespondToTeamInvite, SendJoinRequest
from .mutations.matches import ConfirmMatchResult
from graphene_django.filter import DjangoFilterConnectionField
from .filters import ExtendUserFilter, CityFilter, TeamFilter
from graphene import relay


# class AuthMutation(graphene.ObjectType):
#     register = mutations.Register.Field()
#     verify_account = mutations.VerifyAccount.Field()
#     refresh_token = mutations.RefreshToken.Field()
#     revoke_token = mutations.RevokeToken.Field()



class Query(UserQuery, MeQuery, graphene.ObjectType):
    all_cities = graphene.List(CityType)
    city_name = graphene.Field(CityType, name=graphene.String(required=True))
    team_by_id = graphene.Field(TeamType, id=graphene.ID(required=True))
    player_by_id = graphene.Field(ExtendUserType, user_id=graphene.ID(required=True))
    team_by_user = graphene.Field(TeamType)
    user_profile = graphene.Field(ExtendUserType)
    user_city = graphene.Field(CityType)
    matches = graphene.List(MatchType)
    all_rankings = graphene.List(RankingType)
    ranking = graphene.Field(RankingType, id=graphene.ID(required=True))
    my_notifications = graphene.List(NotificationType)
    teams_in_user_league = graphene.List(TeamType)
    match = graphene.Field(MatchType, id=graphene.ID(required=True))
    player_statistics_for_match = graphene.List(PlayerStatisticsType,match_id=graphene.ID())
    player_statistics_summary = graphene.Field(PlayerStatisticsSummaryType, user_id=graphene.ID(required=True))
    team_statistics_summary = graphene.List(PlayerStatisticsSummaryType, team_id=graphene.ID(required=True))
    search_users = DjangoFilterConnectionField(ExtendUserType, filterset_class=ExtendUserFilter)
    search_cities = DjangoFilterConnectionField(CityType, filterset_class=CityFilter)
    search_teams = DjangoFilterConnectionField(TeamType, filterset_class=TeamFilter)


    def resolve_all_cities(root, info):
        return City.objects.all()
    
    def resolve_city_name(root, info, name):
        try:
            return City.objects.get(name=name)
        except City.DoesNotExist:
            return None
        
    def resolve_team_by_id(root, info, id):
        return Team.objects.get(pk=id)
    
    def resolve_player_by_id(self, info, user_id):
        return ExtendUser.objects.get(pk=user_id)
    
    @login_required
    def resolve_team_by_user(self, info):
        user = info.context.user
        try:
            extend_user = ExtendUser.objects.get(id=user.id)
            return extend_user.team
        except ExtendUser.DoesNotExist:
            return None

    
    @login_required
    def resolve_user_profile(self, info):
        user = info.context.user
        try:
            extend_user = ExtendUser.objects.get(pk=user.pk)
            return extend_user
        except ExtendUser.DoesNotExist:
            raise GraphQLError("User profile does not exist.")
    
    @login_required
    def resolve_user_city(self, info):
        user = info.context.user

        try:
            # Sprawdzenie, czy użytkownik ma przypisane miasto
            if user.city:
                city = City.objects.filter(name=user.city.name).first()

                # Jeśli miasto użytkownika istnieje w systemie, zwracamy je
                if city:
                    return city
                else:
                    # Jeśli użytkownik ma przypisane miasto, ale nie istnieje ono w systemie, zgłoszenie miasta
                    raise GraphQLError("Your city is not recognized. Please submit your city to the league.")
            else:
                # Komunikat, jeśli użytkownik nie ma przypisanego miasta
                raise GraphQLError("Please set your city in settings.")
        except AttributeError:
            return None

    
    def resolve_matches(self, info):
        return Match.objects.all()


    def resolve_all_rankings(root, info):
        return Ranking.objects.all()

    def resolve_ranking(root, info, id):
        return Ranking.objects.get(pk=id)
    
    def resolve_my_notifications(self, info):
        user = info.context.user
        
        notifications = Notification.objects.filter(recipient=user)

        return notifications
    
    def resolve_teams_in_user_league(self, info):
        user = info.context.user

        if not user.is_authenticated:
            raise Exception("Not authenticated!")

        # Znajdź drużynę, do której należy użytkownik, bez ograniczania się do bycia kapitanem
        user_team = Team.objects.filter(players_in_team=user).first()

        if not user_team:
            raise Exception("Nie należysz do żadnej drużyny!")

        # Sprawdź, czy użytkownik jest kapitanem
        if user != user_team.captain:
            raise Exception("Nie jesteś kapitanem żadnej drużyny!")

        # Znajdź ligę użytkownika na podstawie drużyny
        user_league = user_team.league

        # Zwróć wszystkie drużyny z tej ligi
        return Team.objects.filter(league=user_league)

    
    def resolve_match(self, info, id):
        try:
            return Match.objects.get(pk=id)
        except Match.DoesNotExist:
            return None
        
    def resolve_player_statistics_for_match(self, info,match_id):
        return PlayerStatistics.objects.filter(match_id=match_id)
    
    @login_required
    def resolve_player_statistics_summary(self, info, user_id):
        # Upewniamy się, że gracz istnieje
        try:
            player = ExtendUser.objects.get(id=user_id)
        except ExtendUser.DoesNotExist:
            return None
        
        # Agregacja statystyk
        statistics = PlayerStatistics.objects.filter(player=player)
        total_goals = sum(stat.goals for stat in statistics)
        total_assists = sum(stat.assists for stat in statistics)
        total_mvps = sum(1 for stat in statistics if stat.is_mvp)

        # Zwracamy sumaryczne statystyki
        return PlayerStatisticsSummaryType(
            total_goals=total_goals,
            total_assists=total_assists,
            total_mvps=total_mvps
        )

    def resolve_team_statistics_summary(self, info, team_id):
        # Pobierz drużynę na podstawie team_id
        try:
            team = Team.objects.get(pk=team_id)
        except Team.DoesNotExist:
            raise GraphQLError("Team not found")

        summaries = []

        # Pobierz graczy z drużyny
        players = ExtendUser.objects.filter(team=team)  # Używamy relacji z ExtendUser

        for player in players:
            # Agregacja statystyk dla danego gracza
            statistics = PlayerStatistics.objects.filter(player=player)
            total_goals = sum(stat.goals for stat in statistics)
            total_assists = sum(stat.assists for stat in statistics)
            total_mvps = sum(1 for stat in statistics if stat.is_mvp)

            # Dodaj sumaryczne statystyki do listy
            summaries.append(PlayerStatisticsSummaryType(
                user=player,  # Przekazujemy instancję ExtendUser
                id=player.id,
                position=player.position,
                total_goals=total_goals,
                total_assists=total_assists,
                total_mvps=total_mvps
            ))

        return summaries


    def resolve_search_users(root, info, **kwargs):
        return ExtendUser.objects.all()

    def resolve_search_cities(root, info, **kwargs):
        return City.objects.all()

    def resolve_search_teams(root, info, **kwargs):
        return Team.objects.all()
    


class Mutation(graphene.ObjectType):
    register = mutations.Register.Field()
    verify_account = mutations.VerifyAccount.Field()
    refresh_token = mutations.RefreshToken.Field()
    revoke_token = mutations.RevokeToken.Field()
    create_team = CreateTeam.Field()
    login = LoginMutation.Field()
    logout = Logout.Field()
    respond_to_match_invite = RespondToMatchInvite.Field()
    challenge_team_to_match = ChallengeTeamToMatch.Field()
    update_user_profile = UpdateUserProfile.Field()  # Dodanie mutacji edycji profilu
    confirm_match_result = ConfirmMatchResult.Field()
    delete_notification = DeleteNotification.Field()
    send_join_request = SendJoinRequest.Field()
    respond_to_join_request = RespondToJoinRequest.Field()
    leave_team = LeaveTeam.Field()
    delete_account = DeleteAccount.Field()
    delete_team = DeleteTeam.Field()
    update_team = UpdateTeam.Field()
    invite_player = InvitePlayerToTeam.Field()
    respond_to_invite_team = RespondToTeamInvite.Field()
    upload_photo = UploadPhotoMutation.Field()  # Definicja mutacji
    upload_team_logo = UploadTeamLogo.Field()





    # update_notification_status = UpdateNotificationStatus.Field()




schema = graphene.Schema(query=Query, mutation=Mutation)