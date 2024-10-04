from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView
from graphql_jwt.decorators import jwt_cookie
from core.schema import schema
from core.views import activate_account


urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql/', jwt_cookie(csrf_exempt(
        GraphQLView.as_view(graphiql=True, schema=schema)))),
    path('activate/<str:token>/', activate_account, name='activate_account'),
]