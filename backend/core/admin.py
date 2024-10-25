from django.contrib import admin
from .models import ExtendUser, City, Player, League, Team, Match,Ranking, Notification, PlayerStatistics, MatchResult
from django.apps import apps

admin.site.register(ExtendUser)
admin.site.register(City)
admin.site.register(Player)
admin.site.register(League)
admin.site.register(Team)
admin.site.register(Match)
admin.site.register(Ranking)
admin.site.register(Notification)
admin.site.register(PlayerStatistics)
admin.site.register(MatchResult)

app = apps.get_app_config("graphql_auth")

for model_name, model in app.models.items():
    admin.site.register(model)