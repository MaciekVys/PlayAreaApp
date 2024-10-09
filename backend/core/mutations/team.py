import graphene # type: ignore
from ..types import TeamType
from ..models import City, Team, Player
from graphql_jwt.decorators import login_required # type: ignore


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
        try:
            city = City.objects.get(name=city_name)
        except City.DoesNotExist:
            return CreateTeam(success=False, errors="City not found", team=None)

        team = Team(name=name, city=city, captain=user)
        team.save()

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

