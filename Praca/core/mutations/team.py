import graphene
from ..types import TeamType
from ..models import City, Team

class CreateTeam(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        city_name = graphene.String(required=True)

    team = graphene.Field(TeamType)

    def mutate(self, info, name, city_name):
        try:
            city = City.objects.get(name=city_name)
        except:
            raise Exception("City not found")
        
        team = Team(name=name, city=city)
        team.save()
        return CreateTeam(team=team)